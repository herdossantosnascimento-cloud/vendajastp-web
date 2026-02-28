export type CategorySlug =
  | "emprego"
  | "carros"
  | "aluguer_carros"
  | "alojamento_guesthouse"
  | "imoveis";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "date"
  | "email"
  | "url"
  | "tel"
  | "currency";

export type Currency = "STD" | "EUR";

export type FieldOption = { label: string; value: string };

export type FieldWhen = {
  field: string;
  equals?: string | number | boolean;
  in?: Array<string | number | boolean>;
  truthy?: boolean;
};

export type BaseField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  when?: FieldWhen;
};

export type SelectField = BaseField & {
  type: "select" | "multiselect" | "radio";
  options: FieldOption[];
};

export type NumberField = BaseField & {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
};

export type CurrencyField = BaseField & {
  type: "currency";
  currencies: Currency[];
  allowNegotiable?: boolean;
};

export type FieldDefinition = BaseField | SelectField | NumberField | CurrencyField;

export type CategoryWithFields = {
  id: string;
  label: string;
  slug?: CategorySlug;
  fields?: FieldDefinition[];
};
