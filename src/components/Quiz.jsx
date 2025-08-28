import { useState, useEffect, useMemo } from "react"
import { decode } from 'html-entities'
import clsx from "clsx"

export default function Quiz({ data, onPlayAgain, onBackToStart }) {

  const [userAns, setUserAns] = useState([])
  const [correctAns, setCorrectAns] = useState([])
  const [score, setScore] = useState(null)
  const [isQuizOver, setIsQuizOver] = useState(false)

  const questionsWithOptions = useMemo(() => {
    return data.map(entry => {
      const options = [...entry.incorrect_answers]
      const randomIndex = Math.floor(Math.random() * (options.length + 1))
      options.splice(randomIndex, 0, entry.correct_answer)

      return {
        question: entry.question,
        options,
        correctAnswer: entry.correct_answer
      }
    })
  }, [data])

  function getOptionClass(option, questionIdx) {
    if (!isQuizOver) return ""

    return clsx({
      "correct-guess": correctAns[questionIdx] === option,
      "wrong-guess": userAns[questionIdx] === option && correctAns[questionIdx] !== option
    })
  }

  const quizQuestions = questionsWithOptions.map((item, idx) => {

    return (
      <div key={idx} className="question-ctn">
        <div className="question">{decode(item.question)}</div>
        <div className="options">
          {item.options.map((option, optionIdx) => (

            <div key={optionIdx}>
              <input
                disabled={isQuizOver}
                type="radio"
                id={`q${idx}_option${optionIdx}`}
                name={`q${idx}`}
                value={option}
              />

              <label
                className={getOptionClass(option, idx)}
                htmlFor={`q${idx}_option${optionIdx}`}
              >
                {decode(option)}
              </label>
            </div>
          ))}
        </div>
      </div>
    )
  })

  function checkAnswers(formData) {

    const userSelectedAnswers = questionsWithOptions.map((_, idx) => {
      return formData.get(`q${idx}`) || null
    })

    const correctAnswers = questionsWithOptions.map(q => q.correctAnswer)

    const score = userSelectedAnswers.filter((ans, idx) => ans === correctAnswers[idx]).length

    setUserAns(userSelectedAnswers)
    setCorrectAns(correctAnswers)
    setScore(score)
    setIsQuizOver(true)

  }

  return (

    <div className="quiz">
      <form action={checkAnswers}>
        {quizQuestions}


        {isQuizOver ? (
          <div className="score-status">
            <span>You scored {score}/{questionsWithOptions.length}</span>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="button" className='play-btn' onClick={onPlayAgain}>Play Again</button>
            </div>
            <div>
              <button type="button" className="play-btn" onClick={onBackToStart}>Back to Start</button>
            </div>
          </div>
        ) :
          (
            <button type="submit" className="play-btn">Check answers</button>
          )

        }

      </form>
    </div>

  )
}