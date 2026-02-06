export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-muted-foreground/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-2 border-muted-foreground/10"></div>
      </div>
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-8 shadow-lg">
        <LoadingSpinner />
        <p className="text-center text-sm text-muted-foreground mt-4">Loading data...</p>
      </div>
    </div>
  );
}
