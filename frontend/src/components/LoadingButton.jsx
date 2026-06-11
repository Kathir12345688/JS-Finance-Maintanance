export default function LoadingButton({
  loading,
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
