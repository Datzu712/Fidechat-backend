create or replace function random_uuid return VARCHAR2 is
  v_uuid VARCHAR2(40);
begin
  select regexp_replace(rawtohex(sys_guid()), '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})', '\1-\2-\3-\4-\5') into v_uuid from dual;
  return v_uuid;
end random_uuid;