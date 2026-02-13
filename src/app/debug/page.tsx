'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [isClient, setIsClient] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    })
    setIsMobile(window.innerWidth < 768)

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isClient) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Information</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Window Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Width:</span>
                <span>{windowSize.width}px</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Height:</span>
                <span>{windowSize.height}px</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Is Mobile:</span>
                <span className={isMobile ? 'text-green-600' : 'text-red-600'}>
                  {isMobile ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">User Agent:</span>
                <span className="text-xs text-gray-600">
                  {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Components</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-100 rounded">
                <h3 className="font-medium mb-2">Mobile Test</h3>
                <p className="text-sm">This should show different content on mobile vs desktop</p>
                {isMobile ? (
                  <div className="mt-2 p-2 bg-green-200 rounded text-sm">
                    ✅ Mobile Content Showing
                  </div>
                ) : (
                  <div className="mt-2 p-2 bg-yellow-200 rounded text-sm">
                    🖥️ Desktop Content Showing
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-orange-100 rounded">
                <h3 className="font-medium mb-2">App Test</h3>
                <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                  Test Button
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Manual Testing Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check browser console for JavaScript errors</li>
            <li>Try refreshing the preview panel (Ctrl+R or Cmd+R)</li>
            <li>Check if the preview panel is in mobile mode</li>
            <li>Try opening in a new tab</li>
            <li>Check network tab for failed requests</li>
          </ol>
        </div>
      </div>
    </div>
  )
}