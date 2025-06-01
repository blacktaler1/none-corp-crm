const LoadingSpinner = ({ size = 40 }) => {
  return (
    <div className="loading">
      <div className="spinner" style={{ width: size, height: size }} />
    </div>
  )
}

export default LoadingSpinner
