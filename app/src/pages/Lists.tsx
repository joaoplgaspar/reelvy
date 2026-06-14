import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, ListType } from '../store/useStore';
import Icon from '../components/Icon';

const TYPES: { key: ListType; label: string; sub: string }[] = [
  { key: 'minha', label: 'Minha', sub: 'só sua' },
  { key: 'casal', label: 'Casal', sub: 'a dois' },
  { key: 'grupo', label: 'Grupo', sub: 'clube' },
];

export default function Lists() {
  const lists = useStore((s) => s.lists);
  const createList = useStore((s) => s.createList);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<ListType>('grupo');
  const [members, setMembers] = useState<string[]>(['Você', 'Pessoa 2']);

  const arr = Object.values(lists).sort((a, b) => b.createdAt - a.createdAt);

  function pickType(t: ListType) {
    setType(t);
    if (t === 'minha') setMembers(['Você']);
    else if (t === 'casal') setMembers(['Você', 'Par']);
    else setMembers((m) => (m.length >= 2 ? m : ['Você', 'Pessoa 2']));
  }
  function create() {
    createList(name.trim() || 'Nova lista', type, type === 'minha' ? ['Você'] : members);
    setCreating(false);
    setName('');
    pickType('grupo');
  }

  return (
    <div className="page">
      <header className="page-head"><h1 className="page-title">Listas</h1></header>

      {!creating && <button className="btn btn-primary" onClick={() => setCreating(true)}>+ Nova lista</button>}

      {creating && (
        <div className="create-list">
          <input className="search-input" placeholder="Nome da lista" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <div className="type-row">
            {TYPES.map((t) => (
              <button key={t.key} className={`type-card ${type === t.key ? 'is-on' : ''}`} onClick={() => pickType(t.key)}>
                <b>{t.label}</b><span>{t.sub}</span>
              </button>
            ))}
          </div>
          {type !== 'minha' && (
            <div className="members-edit">
              {members.map((m, i) => (
                <div className="player-row" key={i}>
                  <Icon name="profile" size={16} />
                  <input className="player-input" value={m} maxLength={14} onChange={(e) => setMembers(members.map((x, j) => (j === i ? e.target.value : x)))} />
                  {type === 'grupo' && members.length > 2 && (
                    <button className="player-x" onClick={() => setMembers(members.filter((_, j) => j !== i))}><Icon name="x" size={14} /></button>
                  )}
                </div>
              ))}
              {type === 'grupo' && members.length < 6 && (
                <button className="add-player" onClick={() => setMembers([...members, `Pessoa ${members.length + 1}`])}><Icon name="plus" size={14} /> pessoa</button>
              )}
            </div>
          )}
          <div className="create-actions">
            <button className="btn btn-primary" onClick={create}>Criar</button>
            <button className="btn btn-link" onClick={() => setCreating(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="lists-grid">
        {arr.length === 0 && !creating && (
          <p className="empty">Nenhuma lista ainda. Crie uma pro grupo, pro casal, ou só sua.</p>
        )}
        {arr.map((l) => (
          <Link key={l.id} to={`/listas/${l.id}`} className="list-card">
            <div className="list-card-top">
              <b>{l.name}</b>
              <span className={`list-badge ${l.type}`}>{l.type}</span>
            </div>
            <span className="list-card-meta">
              {l.items.length} títulos · {l.members.length} {l.members.length === 1 ? 'pessoa' : 'pessoas'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
