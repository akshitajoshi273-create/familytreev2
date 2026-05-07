import React, { useEffect, useRef, useState } from 'react'
import { familyAPI } from '../api'

const CROP_SIZE = 240
const OUTPUT_SIZE = 600

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export default function PhotoUpload({ memberId, onUploadComplete }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [imageSrc, setImageSrc] = useState('')
  const [imageElement, setImageElement] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [croppedFile, setCroppedFile] = useState(null)
  const [croppedPreview, setCroppedPreview] = useState('')
  const [cropConfirmed, setCropConfirmed] = useState(false)
  const [uploadMode, setUploadMode] = useState('original')
  const dragState = useRef(null)

  useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc)
      }
      if (croppedPreview) {
        URL.revokeObjectURL(croppedPreview)
      }
    }
  }, [imageSrc, croppedPreview])

  const resetCropState = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    setCroppedFile(null)
    setCropConfirmed(false)
    setUploadMode('original')
    if (croppedPreview) {
      URL.revokeObjectURL(croppedPreview)
      setCroppedPreview('')
    }
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(selected.type)) {
        setError('Only PNG, JPG, GIF, and WebP formats are supported')
        return
      }

      if (imageSrc) {
        URL.revokeObjectURL(imageSrc)
      }

      const nextSrc = URL.createObjectURL(selected)
      setFile(selected)
      setImageSrc(nextSrc)
      setImageElement(null)
      setError('')
      setSuccess(false)
      resetCropState()
    }
  }

  const handleModeChange = (mode) => {
    setUploadMode(mode)
    setError('')
  }

  const getBaseScale = () => {
    if (!imageElement) {
      return 1
    }
    return Math.max(CROP_SIZE / imageElement.width, CROP_SIZE / imageElement.height)
  }

  const getBounds = (nextZoom = zoom) => {
    if (!imageElement) {
      return { maxX: 0, maxY: 0 }
    }

    const renderedWidth = imageElement.width * getBaseScale() * nextZoom
    const renderedHeight = imageElement.height * getBaseScale() * nextZoom
    return {
      maxX: Math.max((renderedWidth - CROP_SIZE) / 2, 0),
      maxY: Math.max((renderedHeight - CROP_SIZE) / 2, 0)
    }
  }

  const clampPosition = (nextPosition, nextZoom = zoom) => {
    const bounds = getBounds(nextZoom)
    return {
      x: clamp(nextPosition.x, -bounds.maxX, bounds.maxX),
      y: clamp(nextPosition.y, -bounds.maxY, bounds.maxY)
    }
  }

  const handleZoomChange = (e) => {
    const nextZoom = Number(e.target.value)
    setZoom(nextZoom)
    setPosition((prev) => clampPosition(prev, nextZoom))
    setCropConfirmed(false)
  }

  const handlePointerDown = (e) => {
    if (!imageElement) {
      return
    }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    }
    setCropConfirmed(false)
  }

  const handlePointerMove = (e) => {
    if (!dragState.current || dragState.current.pointerId !== e.pointerId) {
      return
    }

    const deltaX = e.clientX - dragState.current.startX
    const deltaY = e.clientY - dragState.current.startY
    setPosition(
      clampPosition({
        x: dragState.current.initialX + deltaX,
        y: dragState.current.initialY + deltaY
      })
    )
  }

  const handlePointerUp = (e) => {
    if (dragState.current?.pointerId === e.pointerId) {
      dragState.current = null
    }
  }

  const confirmCrop = async () => {
    if (!file || !imageElement) {
      setError('Please select an image first')
      return
    }

    try {
      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const context = canvas.getContext('2d')

      const scale = getBaseScale() * zoom
      const drawWidth = imageElement.width * scale * (OUTPUT_SIZE / CROP_SIZE)
      const drawHeight = imageElement.height * scale * (OUTPUT_SIZE / CROP_SIZE)
      const offsetFactor = OUTPUT_SIZE / CROP_SIZE
      const drawX = (OUTPUT_SIZE - drawWidth) / 2 + position.x * offsetFactor
      const drawY = (OUTPUT_SIZE - drawHeight) / 2 + position.y * offsetFactor

      context.drawImage(imageElement, drawX, drawY, drawWidth, drawHeight)

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
      if (!blob) {
        throw new Error('Unable to prepare cropped image')
      }

      const finalFile = new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'photo'}-cropped.jpg`, {
        type: 'image/jpeg'
      })

      if (croppedPreview) {
        URL.revokeObjectURL(croppedPreview)
      }

      setCroppedFile(finalFile)
      setCroppedPreview(URL.createObjectURL(blob))
      setCropConfirmed(true)
      setError('')
    } catch (err) {
      setError(err.message || 'Crop failed')
    }
  }

  const handleUpload = async () => {
    const fileToUpload = uploadMode === 'crop' ? croppedFile : file

    if (!fileToUpload) {
      setError(uploadMode === 'crop' ? 'Please confirm the crop before uploading' : 'Please select a photo first')
      return
    }

    try {
      setUploading(true)
      setError('')

      const response = await familyAPI.uploadPhoto(memberId, fileToUpload)

      if (response.data.success) {
        setSuccess(true)
        setFile(null)
        setImageElement(null)
        if (imageSrc) {
          URL.revokeObjectURL(imageSrc)
          setImageSrc('')
        }
        resetCropState()
        setTimeout(() => {
          onUploadComplete?.(response.data.data?.photo_url || null)
        }, 800)
      }
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const renderedScale = imageElement ? getBaseScale() * zoom : 1

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '8px',
        padding: '20px'
      }}
    >
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '15px',
          color: '#333'
        }}
      >
        Upload Photo
      </h3>

      <div
        style={{
          border: '2px dashed #ddd',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '15px'
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="photo-input"
        />
        <label
          htmlFor="photo-input"
          style={{
            display: 'block',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>📸</div>
          <p
            style={{
              margin: '0 0 5px 0',
              fontWeight: '600',
              color: '#333'
            }}
          >
            Click to select a photo
          </p>
          <p
            style={{
              margin: '0',
              fontSize: '12px',
              color: '#666'
            }}
          >
            PNG, JPG, GIF or WebP • Max 10MB
          </p>
        </label>
      </div>

      {file && (
        <div
          style={{
            background: '#f0f4ff',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px'
          }}
        >
          <p
            style={{
              margin: '0',
              fontSize: '14px',
              color: '#333'
            }}
          >
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        </div>
      )}

      {file && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={() => handleModeChange('original')}
            style={{
              padding: '10px 16px',
              background: uploadMode === 'original' ? '#0f766e' : '#e5e7eb',
              color: uploadMode === 'original' ? 'white' : '#334155',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Upload Original Photo
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('crop')}
            style={{
              padding: '10px 16px',
              background: uploadMode === 'crop' ? '#0f766e' : '#e5e7eb',
              color: uploadMode === 'crop' ? 'white' : '#334155',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Crop Photo
          </button>
        </div>
      )}

      {imageSrc && uploadMode === 'crop' && (
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              width: `${CROP_SIZE}px`,
              height: `${CROP_SIZE}px`,
              margin: '0 auto 14px',
              overflow: 'hidden',
              borderRadius: '18px',
              position: 'relative',
              background: '#111827',
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.08)',
              touchAction: 'none'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <img
              src={imageSrc}
              alt="Crop preview"
              onLoad={(e) => {
                setImageElement(e.currentTarget)
                setPosition({ x: 0, y: 0 })
                setZoom(1)
              }}
              draggable={false}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${renderedScale})`,
                transformOrigin: 'center center',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
          </div>

          <div style={{ maxWidth: '320px', margin: '0 auto' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
              Zoom
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={handleZoomChange}
              style={{ width: '100%' }}
            />
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
              Drag the image to adjust the crop, then confirm it.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={confirmCrop}
              style={{
                padding: '10px 16px',
                background: '#0f766e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Confirm Crop
            </button>
            {cropConfirmed && (
              <span style={{ alignSelf: 'center', fontSize: '13px', color: '#166534', fontWeight: '600' }}>
                Crop confirmed
              </span>
            )}
          </div>
        </div>
      )}

      {file && uploadMode === 'original' && (
        <div
          style={{
            background: '#f8fafc',
            padding: '14px',
            borderRadius: '8px',
            marginBottom: '15px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '10px' }}>
            Photo preview
          </div>
          <img
            src={imageSrc}
            alt="Original preview"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #cbd5e1'
            }}
          />
        </div>
      )}

      {croppedPreview && uploadMode === 'crop' && (
        <div
          style={{
            background: '#f8fafc',
            padding: '14px',
            borderRadius: '8px',
            marginBottom: '15px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '10px' }}>
            Final photo preview
          </div>
          <img
            src={croppedPreview}
            alt="Cropped preview"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #cbd5e1'
            }}
          />
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            fontSize: '13px'
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            fontSize: '13px'
          }}
        >
          Photo uploaded successfully!
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={(!file || (uploadMode === 'crop' && !croppedFile)) || uploading}
        style={{
          width: '100%',
          padding: '10px',
          background: (file && (uploadMode === 'original' || croppedFile) && !uploading)
            ? 'linear-gradient(135deg, #667eea, #764ba2)'
            : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: (file && (uploadMode === 'original' || croppedFile) && !uploading) ? 'pointer' : 'not-allowed'
        }}
      >
        {uploading ? 'Uploading...' : 'Upload Photo'}
      </button>
    </div>
  )
}
