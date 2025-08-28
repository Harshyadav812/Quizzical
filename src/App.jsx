import { useState } from 'react'
import './App.css'
import Quiz from './components/Quiz'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function App() {
  const [quizPage, setQuizPage] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentCategory, setCurrentCategory] = useState("animals")
  const [currentDifficulty, setCurrentDifficulty] = useState("easy")

  async function fetchData(category, difficulty, retries = 3, delay = 1000) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`)

      console.log(`https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`)
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

  function handleStartQuiz(formData) {
    const category = formData.get("category")
    const difficulty = formData.get("difficulty")

    setCurrentCategory(category)
    setCurrentDifficulty(difficulty)

    console.log(category, difficulty)
    if (!loading) {
      fetchData(category, difficulty)
    }
  }

  const handlePlayAgain = () => {
    setQuizPage(false)
    setData([])
    setError(null)
    fetchData(currentCategory, currentDifficulty)
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
              handleStartQuiz(currentCategory, currentDifficulty)
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
      <form action={handleStartQuiz}>

        <Select name="category" defaultValue={'9'} required>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="9">General Knowledge</SelectItem>
            <SelectItem value="10">Books</SelectItem>
            <SelectItem value="11">Film</SelectItem>
            <SelectItem value="12">Music</SelectItem>
            <SelectItem value="21">Sports</SelectItem>
            <SelectItem value="27">Animals</SelectItem>
            <SelectItem value="29">Comics</SelectItem>
          </SelectContent>
        </Select>

        <Select name="difficulty" defaultValue={'easy'} required>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <button
          type='submit'
          className='play-btn'
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Start Quiz'}
        </button>
      </form>

    </div >
  )
}

export default App
