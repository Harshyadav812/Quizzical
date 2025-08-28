import { useState } from 'react'
import './App.css'
import Quiz from './components/Quiz'

function App() {
  const [quizPage, setQuizPage] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async (retries = 3, delay = 1000) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("https://opentdb.com/api.php?amount=5&category=17&difficulty=medium&type=multiple")

      if (res.status === 429) {
        if (retries > 0) {
          console.log(`Rate limited. Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return fetchData(retries - 1, delay * 2)
        } else {
          throw new Error("Too many requests. Please try again later.")
        }
      }

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const responseData = await res.json()
      setData(responseData.results)
      setQuizPage(true)
    } catch (err) {
      setError(err.message)
      console.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = () => {
    if (!loading) {
      fetchData()
    }
  }

  const handlePlayAgain = () => {
    setQuizPage(false)
    setData([])
    setError(null)
    fetchData()
  }

  const handleBackToStart = () => {
    setQuizPage(false)
    setData([])
    setError(null)
  }

  // Early return for error state
  if (error) {
    return (
      <div className='start-page'>
        <div>
          <h1>Oops!</h1>
          <p>Error: {error}</p>
          <button
            className='play-btn'
            onClick={() => {
              setError(null)
              handleStartQuiz()
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className='start-page'>
        <div>
          <h1>Loading...</h1>
          <p>Fetching your quiz questions...</p>
        </div>
      </div>
    )
  }

  // Quiz page
  if (quizPage && data.length > 0) {
    return (
      <Quiz
        data={data}
        onPlayAgain={handlePlayAgain}
        onBackToStart={handleBackToStart}
      />
    )
  }

  // Start page (default)
  return (
    <div className='start-page'>
      <div>
        <h1>Quizzical</h1>
        <p>Take a random quiz to check your general knowledge</p>
      </div>
      <button
        className='play-btn'
        disabled={loading}
        onClick={handleStartQuiz}
      >
        {loading ? 'Loading...' : 'Start Quiz'}
      </button>
    </div>
  )
}

export default App
