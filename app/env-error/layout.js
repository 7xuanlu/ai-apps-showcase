export const metadata = {
  title: 'Environment Configuration Error',
  description: 'Environment configuration issues detected',
}

export default function ErrorLayout({ children }) {
  return (
    <div className="env-error-layout">
      {children}
    </div>
  )
}