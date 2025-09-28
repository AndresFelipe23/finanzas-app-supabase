-- Función para crear perfil de usuario automáticamente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)));
  return new;
end;
$$;

-- Trigger para crear perfil automáticamente cuando se registra un usuario
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Función para obtener el saldo total de un usuario
create or replace function get_saldo_total(user_id uuid)
returns decimal(15,2)
language plpgsql
security definer
as $$
declare
  total decimal(15,2);
begin
  select coalesce(sum(saldo), 0) into total
  from public.cuentas
  where usuario_id = user_id;
  
  return total;
end;
$$;

-- Función para actualizar saldo de cuenta después de una transacción
create or replace function update_account_balance()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    -- Actualizar saldo al insertar transacción
    if new.tipo = 'ingreso' then
      update public.cuentas 
      set saldo = saldo + new.monto 
      where id = new.cuenta_id;
    else
      update public.cuentas 
      set saldo = saldo - new.monto 
      where id = new.cuenta_id;
    end if;
    return new;
  elsif TG_OP = 'UPDATE' then
    -- Revertir transacción anterior
    if old.tipo = 'ingreso' then
      update public.cuentas 
      set saldo = saldo - old.monto 
      where id = old.cuenta_id;
    else
      update public.cuentas 
      set saldo = saldo + old.monto 
      where id = old.cuenta_id;
    end if;
    
    -- Aplicar nueva transacción
    if new.tipo = 'ingreso' then
      update public.cuentas 
      set saldo = saldo + new.monto 
      where id = new.cuenta_id;
    else
      update public.cuentas 
      set saldo = saldo - new.monto 
      where id = new.cuenta_id;
    end if;
    return new;
  elsif TG_OP = 'DELETE' then
    -- Revertir transacción al eliminar
    if old.tipo = 'ingreso' then
      update public.cuentas 
      set saldo = saldo - old.monto 
      where id = old.cuenta_id;
    else
      update public.cuentas 
      set saldo = saldo + old.monto 
      where id = old.cuenta_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

-- Trigger para actualizar saldo automáticamente
create trigger update_account_balance_trigger
  after insert or update or delete on public.transacciones
  for each row execute function update_account_balance();
