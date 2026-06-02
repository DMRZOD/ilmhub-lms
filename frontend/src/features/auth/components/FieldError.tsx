export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-t-12 font-medium text-ilm-error">
      {message}
    </p>
  );
}
