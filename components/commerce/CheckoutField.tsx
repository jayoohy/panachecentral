import {
  FIELD_CLASS,
  FIELD_LABEL_CLASS,
} from "@/components/shared/field-styles";

/** Labelled checkout text input; non-required fields say "(optional)" (audit F6). */
export function CheckoutField({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className={FIELD_LABEL_CLASS}>
        {label}
        {!required && <span className="text-bone/40"> (optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 ${FIELD_CLASS}`}
      />
    </div>
  );
}
