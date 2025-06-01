"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"

const SearchInput = ({ placeholder = "Qidirish...", onSearch, debounceMs = 300, className = "" }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, onSearch, debounceMs])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const handleClear = () => {
    setSearchTerm("")
    onSearch("")
  }

  return (
    <form onSubmit={handleSubmit} className={`search-input-wrapper ${className}`}>
      <div className={`search-input-container ${isFocused ? "focused" : ""}`}>
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="search-input-field"
        />
        {searchTerm && (
          <button type="button" onClick={handleClear} className="search-clear-btn">
            <X size={16} />
          </button>
        )}
      </div>
    </form>
  )
}

export default SearchInput
