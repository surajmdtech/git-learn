import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : import.meta.env.VITE_API_URL;

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
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(5);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAuthor, setEditAuthor] = useState<string>('');
  const [editText, setEditText] = useState<string>('');

  // Fetch quotes with pagination and search
  const fetchQuotes = () => {
    fetch(`${API_BASE}/quotes?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        setQuotes(data.data);
        setTotal(data.total);
      })
      .catch((err) => console.error('Failed to fetch quotes:', err));
  };

  useEffect(() => {
    fetchQuotes();
  }, [page, search]);

  // Handle form submission for adding new quote
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!author || !text) return;

    try {
      const res = await fetch(`${API_BASE}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, text }),
      });

      if (!res.ok) throw new Error('Failed to add quote');

      setAuthor('');
      setText('');
      setPage(1);
      fetchQuotes();
    } catch (error) {
      console.error('Failed to add quote:', error);
    }
  };

  // Handle delete quote
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;

    try {
      const res = await fetch(`${API_BASE}/quotes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete quote');

      fetchQuotes();
    } catch (error) {
      console.error('Failed to delete quote:', error);
    }
  };

  // Start editing a quote
  const startEditing = (quote: Quote) => {
    setEditingId(quote.id);
    setEditAuthor(quote.author);
    setEditText(quote.text);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditAuthor('');
    setEditText('');
  };

  // Save edited quote
  const saveEdit = async (id: number) => {
    if (!editAuthor || !editText) return;

    try {
      const res = await fetch(`${API_BASE}/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: editAuthor, text: editText }),
      });

      if (!res.ok) throw new Error('Failed to update quote');

      setEditingId(null);
      setEditAuthor('');
      setEditText('');
      fetchQuotes();
    } catch (error) {
      console.error('Failed to update quote:', error);
    }
  };

  // Pagination controls
  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>📝 Quote Keeper</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={{ flex: 1 }}
        />
        <input
          type="text"
          placeholder="Quote"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 2 }}
        />
        <button type="submit">Add</button>
      </form>

      <input
        type="text"
        placeholder="Search quotes..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
      />

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {quotes.map((q) => (
          <li
            key={q.id}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            {editingId === q.id ? (
              <>
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  style={{ marginBottom: '0.5rem', width: '100%' }}
                />
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{ marginBottom: '0.5rem', width: '100%' }}
                />
                <button onClick={() => saveEdit(q.id)} style={{ marginRight: '0.5rem' }}>
                  Save
                </button>
                <button onClick={cancelEditing}>Cancel</button>
              </>
            ) : (
              <>
                <strong>{q.author}</strong>: {q.text}
                <div style={{ marginTop: '0.5rem' }}>
                  <button onClick={() => startEditing(q)} style={{ marginRight: '0.5rem' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(q.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
