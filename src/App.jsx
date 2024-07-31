// src/App.jsx

import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [generatedSql, setGeneratedSql] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse('Processing your request...');
    setGeneratedSql('');

    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ natural_language_question: question })
      });

      const data = await response.json();

      if (response.ok) {
        setResponse(data.llm_summarization || 'No LLM Summary Produced.');
        setGeneratedSql(data.generated_sql || 'No generated SQL.');
      } else {
        setResponse(`Error: ${data.error}`);
        setGeneratedSql('');
      }
    } catch (error) {
      setResponse(`Fetch error: ${error.message}`);
      setGeneratedSql('');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      correlation_id: generateCorrelationId(),
      customer_id: "CUST12345",
      llm_step: "some_step",
      original_question: question,
      llm_generated_sql_select: generatedSql,
      llm_summary: response,
      information_about_success: feedback,
      needed_improvements: feedback,
    };

    try {
      const feedbackResponse = await fetch(process.env.REACT_APP_FEEDBACK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (feedbackResponse.ok) {
        alert('Feedback submitted successfully.');
      } else {
        alert('Error submitting feedback.');
      }
    } catch (error) {
      alert(`Error submitting feedback: ${error.message}`);
    }
  };

  const generateCorrelationId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  return (
    <div className="container">
      <h1>Vyrasage Co-Pilot</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-box">
          <textarea
            placeholder="Ask your question here..."
            value={question}
            onChange={handleQuestionChange}
          />
        </div>
        <div className="button-container">
          <button type="submit">Submit</button>
          <button type="button" onClick={handleFeedbackSubmit}>Submit Feedback</button>
        </div>
      </form>
      <div className="response-box">
        <textarea
          placeholder="LLM Summary..."
          value={response}
          readOnly
        />
      </div>
      <div className="response-box">
        <textarea
          placeholder="Generated SQL..."
          value={generatedSql}
          readOnly
        />
      </div>
      <div className="input-box">
        <textarea
          placeholder="Feedback..."
          value={feedback}
          onChange={handleFeedbackChange}
        />
      </div>
    </div>
  );
};

export default App;
