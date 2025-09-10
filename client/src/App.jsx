// client/src/App.jsx
import { useState, useEffect } from "react";
import './App.css';
import { API_BASE } from "./config";


function App() {
  const [flags, setFlags] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | playing | finished
  const [error, setError] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const total = questions.length;
  const currentQ = questions[current];

  async function loadFlags() {
    setStatus("loading");
    try {

      const res = await fetch(`${API_BASE}/api/flags`);

      const data = await res.json();
      setFlags(data);
      setStatus("ready");
    } catch (e) {
      setError(
        "Failed to load flags from server. Make sure backend is running on port 5000."
      );
      setStatus("idle");
    }
  }

  
  // ✅ Fixed: Unique flags per game, no repetition
  function generateQuestions(flags, n) {
    // Shuffle once
    const shuffled = [...flags].sort(() => 0.5 - Math.random());

    // Pick n unique flags (one per question)
    const selectedFlags = shuffled.slice(0, n);

    return selectedFlags.map((answerFlag) => {
      // Pick 3 wrong options
      const wrongOptions = shuffled
        .filter(f => f.name !== answerFlag.name)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      // Mix answer + wrongs
      const options = [...wrongOptions, answerFlag]
        .sort(() => 0.5 - Math.random());

      return {
        image: answerFlag.image,
        answer: answerFlag.name,
        options: options.map(f => f.name),
      };
    });
  }

  function startGame() {
    if (!flags.length) return;
    const qs = generateQuestions(flags, numQuestions);
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setStatus("playing");
  }

  function handleOptionClick(opt) {
    if (selected) return;
    setSelected(opt);
    if (opt === currentQ.answer) setScore((s) => s + 1);
  }

  function next() {
    if (current + 1 >= total) {
      setStatus("finished");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }

  useEffect(() => {
    // Uncomment if you want flags to load automatically on mount
    // loadFlags();
  }, []);

  return (
    <div className="container">
      <h1>  Guess the Country Flag </h1>
      <p className="question-num">
            Question {current + 1} of {total}
          </p>

      {status === "idle" && (
        <div className="card">
          <p>
            Welcome! Click start to load flags and begin the game.
          </p>
          <button onClick={loadFlags}>Start</button>
        </div>
      )}

      {status === "loading" && <p>Loading flags...</p>}

      {status === "ready" && (
        <div className="card">
          <div className="row">
            <label>Number of questions:&nbsp;</label>
            <input
              type="number"
              min="5"
              max={Math.min(36, flags.length)}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            />
          </div>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}

      {status === "playing" && currentQ && (
        <div className="game">
           
          <img src={currentQ.image} alt="flag" width="330" />
          <div className="options">
            {currentQ.options.map((opt) => (
              <button
                key={opt}
                className={`option ${
                  selected
                    ? opt === currentQ.answer
                      ? "correct"
                      : opt === selected
                      ? "wrong"
                      : ""
                    : ""
                }`}
                onClick={() => handleOptionClick(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          {selected && (
            <button className="next-btn" onClick={next}>
              {current + 1 >= total ? "Finish" : "Next  >"}
            </button>
          )}
        </div>
      )}

      {status === "finished" && (
        <div className="card">
          <h2>Game Over 🎉</h2>
          <p>
            You scored {score} / {total}
          </p>
          <button onClick={startGame}>Play Again</button>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default App;
