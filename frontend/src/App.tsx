import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
const API_BASE = import.meta.env.VITE_API_URL;

// Define the Quote type
type Quote = {
  id: number;
  author: string;
  text: string;
};

function App() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [author, setAuthor] = useState<string>('');
  const [text, setText] = useState<string>('');

  // Fetch all quotes
  useEffect(() => {
    fetch(`${API_BASE}/quotes`)
      .then((res) => res.json())
      .then((data: Quote[]) => setQuotes(data))
      .catch((err) => console.error('Failed to fetch quotes:', err));
  }, []);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!author || !text) return;

    try {
      const res = await fetch(`${API_BASE}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, text }),
      });

      const newQuote: Quote = await res.json();
      setQuotes((prev) => [...prev, newQuote]);
      setAuthor('');
      setText('');
    } catch (error) {
      console.error('Failed to add quote:', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📝 Quote Keeper</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <input
          type="text"
          placeholder="Quote"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <button type="submit">Add Quote</button>
      </form>

      <ul>
        {quotes.map((q) => (
          <li key={q.id}>
            <strong>{q.author}</strong>: {q.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
