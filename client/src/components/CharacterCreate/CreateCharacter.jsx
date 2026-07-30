import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../api';
import { addCharacter } from '../../store/characterSlice';
import './CreateCharacter.css';

export default function CreateCharacter() {
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    api
      .get('/characters/classes')
      .then((res) => setClasses(res.data.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/characters', {
        name,
        class: charClass,
      });

      if (data.success) {
        dispatch(addCharacter(data.data));
        navigate('/character-select');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-character">
      <h1>Create Character</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Character Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            maxLength={12}
            pattern="[a-zA-Z0-9]+"
            placeholder="3-12 alphanumeric characters"
          />
        </div>

        <div className="form-group">
          <label>Class</label>
          <div className="class-grid">
            {classes.map((cls) => (
              <div
                key={cls.name}
                className={`class-card ${charClass === cls.name ? 'selected' : ''}`}
                onClick={() => setCharClass(cls.name)}
              >
                <h3>{cls.name}</h3>
                <p>{cls.description}</p>
                <div className="class-stats">
                  <span>STR {cls.stats.strength}</span>
                  <span>AGI {cls.stats.agility}</span>
                  <span>VIT {cls.stats.vitality}</span>
                  <span>ENE {cls.stats.energy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/character-select')}>
            Back
          </button>
          <button type="submit" disabled={loading || !charClass}>
            {loading ? 'Creating...' : 'Create Character'}
          </button>
        </div>
      </form>
    </div>
  );
}