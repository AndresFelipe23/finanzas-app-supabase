-- 1. Función para crear un perfil de usuario al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, nombre)
  VALUES (new.id, new.raw_user_meta_data->>'nombre');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función anterior
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Función para actualizar el saldo de una cuenta
CREATE OR REPLACE FUNCTION public.update_cuenta_balance()
RETURNS TRIGGER AS $$
DECLARE
  monto_cambio NUMERIC;
BEGIN
  -- Al insertar una nueva transacción
  IF (TG_OP = 'INSERT') THEN
    monto_cambio := CASE WHEN NEW.tipo = 'ingreso' THEN NEW.monto ELSE -NEW.monto END;
    UPDATE public.cuentas
    SET saldo = saldo + monto_cambio
    WHERE id = NEW.cuenta_id;
    RETURN NEW;
  
  -- Al eliminar una transacción
  ELSIF (TG_OP = 'DELETE') THEN
    monto_cambio := CASE WHEN OLD.tipo = 'ingreso' THEN -OLD.monto ELSE OLD.monto END;
    UPDATE public.cuentas
    SET saldo = saldo + monto_cambio
    WHERE id = OLD.cuenta_id;
    RETURN OLD;

  -- Al actualizar una transacción
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Si la cuenta no cambió, calcular el diferencial
    IF OLD.cuenta_id = NEW.cuenta_id THEN
      monto_cambio := (CASE WHEN NEW.tipo = 'ingreso' THEN NEW.monto ELSE -NEW.monto END) - 
                      (CASE WHEN OLD.tipo = 'ingreso' THEN OLD.monto ELSE -OLD.monto END);
      UPDATE public.cuentas
      SET saldo = saldo + monto_cambio
      WHERE id = NEW.cuenta_id;
    -- Si la cuenta cambió, revertir en la antigua y aplicar en la nueva
    ELSE
      -- Revertir de la cuenta antigua
      monto_cambio := CASE WHEN OLD.tipo = 'ingreso' THEN -OLD.monto ELSE OLD.monto END;
      UPDATE public.cuentas SET saldo = saldo + monto_cambio WHERE id = OLD.cuenta_id;
      -- Aplicar a la cuenta nueva
      monto_cambio := CASE WHEN NEW.tipo = 'ingreso' THEN NEW.monto ELSE -NEW.monto END;
      UPDATE public.cuentas SET saldo = saldo + monto_cambio WHERE id = NEW.cuenta_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para la actualización de saldos
CREATE TRIGGER on_transaction_insert
  AFTER INSERT ON public.transacciones
  FOR EACH ROW EXECUTE PROCEDURE public.update_cuenta_balance();

CREATE TRIGGER on_transaction_update
  AFTER UPDATE ON public.transacciones
  FOR EACH ROW EXECUTE PROCEDURE public.update_cuenta_balance();

CREATE TRIGGER on_transaction_delete
  AFTER DELETE ON public.transacciones
  FOR EACH ROW EXECUTE PROCEDURE public.update_cuenta_balance();
