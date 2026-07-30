import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api';
import { setCharacters, setClasses, selectCharacter } from '../../store/characterSlice';
import { logout as authLogout } from '../../store/authSlice';
import './CharacterSelect.css';

export default function CharacterSelect() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { characters, classes } = useSelector((state) => state.character);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [charRes, classRes] = await Promise.all([
          api.get('/characters'),
          api.get('/characters/classes'),
        ]);
        dispatch(setCharacters(charRes.data.data));
        dispatch(setClasses(classRes.data.data));
      } catch (err) {
        if (err.response?.status === 401) {
          dispatch(authLogout());
          navigate('/login');
        }
      }
    };
    loadData();
  }, []);

  const handleSelect = (char) => {
    dispatch(selectCharacter(char));
    localStorage.setItem('selectedCharacter', char._id);
    navigate('/game');
  };

  const handleCreate = () => navigate('/create-character');

  const handleLogout = () => {
    dispatch(authLogout());
    navigate('/login');
  };

  return (
    <div className="character-select">
      <h1>Character Selection</h1>
      <p>Welcome, {user?.username}</p>

      <div className="character-list">
        {characters.map((char) => (
          <div key={char._id} className="character-card" onClick={() => handleSelect(char)}>
            <div className="character-icon">{char.class[0]}</div>
            <div className="character-info">
              <h3>{char.name}</h3>
              <p>{char.class} - Level {char.level}</p>
            </div>
          </div>
        ))}

        <div className="character-card create-card" onClick={handleCreate}>
          <div className="create-icon">+</div>
          <div className="character-info">
            <h3>Create New Character</h3>
          </div>
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}