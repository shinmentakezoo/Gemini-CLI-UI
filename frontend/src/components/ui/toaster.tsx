import * as React from "react"

// Simple toast implementation - in a real app you'd use a library like react-hot-toast
export const Toaster: React.FC = () => {
  return <div id="toast-container" className="fixed top-4 right-4 z-50" />
}
