-- Healthcheck SQL script for Oracle
-- Se utiliza para verificar si la base de datos Oracle está funcionando correctamente
-- Este archivo debe guardarse en el directorio raíz de la aplicación

-- Retorna un código de salida 0 si la base de datos está funcionando correctamente
SELECT 1 FROM DUAL;
EXIT;
