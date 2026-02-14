export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`skeleton ${className}`}
      {...props}
    />
  );
}
