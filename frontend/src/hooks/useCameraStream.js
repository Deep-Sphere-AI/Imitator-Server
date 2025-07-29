  export async function getCameraStream() {

    const constraintsList = [
    { video: { width: { ideal: 1280 }, height: { ideal: 720 } } },
    { video: true },
  ]
    
    for (let constraints of constraintsList) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err) {
        console.warn('Constraint failed', constraints, err.name)
        if (err.name !== 'OverconstrainedError') throw err
      }
    }
    throw new Error('No valid camera configuration.')
  }