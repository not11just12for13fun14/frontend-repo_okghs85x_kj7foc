import { useEffect, useMemo, useState } from 'react'
import { AuthProvider, useAuth } from './components/AuthContext'
import { Auth, Movies, MyList } from './components/api'

function Header({ onSeed }) {
  const { user, token, setToken, setUser } = useAuth()
  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/60 to-transparent text-white">
      <div className="text-2xl font-bold">Flix</div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <button
              onClick={onSeed}
              className="hidden sm:inline px-3 py-1.5 rounded bg-white/10 hover:bg-white/20"
            >Seed catalog</button>
            <span className="text-sm hidden sm:inline">{user.name}</span>
            <button
              onClick={() => { setToken(''); setUser(null) }}
              className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700"
            >Sign out</button>
          </>
        ) : (
          <AuthButtons />
        )}
      </div>
    </header>
  )
}

function AuthButtons() {
  const { setToken, setUser } = useAuth()
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('demo@flix.com')
  const [password, setPassword] = useState('demo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let res
      if (mode === 'signup') res = await Auth.register(name || 'Demo User', email, password)
      else res = await Auth.login(email, password)
      setToken(res.token)
      setUser(res.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      {mode === 'signup' && (
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" className="px-3 py-1.5 rounded bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none" />
      )}
      <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="px-3 py-1.5 rounded bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none" />
      <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="px-3 py-1.5 rounded bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none" />
      <button disabled={loading} className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50">{mode==='signup' ? 'Sign up' : 'Sign in'}</button>
      <button type="button" onClick={()=>setMode(mode==='signup'?'signin':'signup')} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20">{mode==='signup'?'Have an account?':'New here?'}</button>
      {error && <span className="text-sm text-red-300 ml-2">{error}</span>}
    </form>
  )
}

function Hero({ featured }) {
  if (!featured) return null
  const item = featured[0]
  return (
    <section className="relative h-[60vh] sm:h-[70vh] w-full overflow-hidden">
      <img src={item.thumbnail_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-0 bg-gradient-to-t from-black to-black/10"/>
      <div className="absolute bottom-16 left-6 text-white max-w-xl">
        <h1 className="text-4xl sm:text-6xl font-extrabold drop-shadow-lg">{item.title}</h1>
        <p className="mt-3 text-white/90 line-clamp-3">{item.description}</p>
        <div className="mt-4 flex gap-3">
          <a href={`/watch/${item.id}`} className="px-4 py-2 rounded bg-white text-black font-semibold">Play</a>
          <a href="#catalog" className="px-4 py-2 rounded bg-white/10 text-white hover:bg-white/20 font-semibold">More Info</a>
        </div>
      </div>
    </section>
  )
}

function Row({ title, items, onAdd }) {
  return (
    <section className="px-6 py-4" id="catalog">
      <h2 className="text-white text-xl font-semibold mb-2">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map(m => (
          <div key={m.id} className="min-w-[180px] relative group">
            <img src={m.thumbnail_url} alt={m.title} className="w-[180px] h-[270px] object-cover rounded"/>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded flex items-end p-2">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity w-full flex justify-between items-center">
                <span className="text-white text-sm font-medium line-clamp-1">{m.title}</span>
                {onAdd && <button onClick={()=>onAdd(m)} className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white">+ My List</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Home() {
  const { token } = useAuth()
  const [featured, setFeatured] = useState([])
  const [movies, setMovies] = useState([])
  const [comedy, setComedy] = useState([])
  const [mylist, setMylist] = useState([])

  const load = async () => {
    const [feat, all, com] = await Promise.all([
      Movies.list({ featured: true }),
      Movies.list(),
      Movies.list({ genre: 'Comedy' }),
    ])
    setFeatured(feat)
    setMovies(all)
    setComedy(com)
    if (token) {
      const ml = await MyList.get(token)
      setMylist(ml)
    } else setMylist([])
  }

  const seed = async () => {
    await Movies.seed()
    await load()
  }

  useEffect(() => { load() }, [token])

  const addToList = async (m) => {
    if (!token) return alert('Sign in to save to your list')
    await MyList.add(token, m.id)
    const ml = await MyList.get(token)
    setMylist(ml)
  }

  return (
    <div className="bg-black min-h-screen">
      <Header onSeed={seed} />
      <Hero featured={featured} />
      <div className="mt-[65vh] sm:mt-[75vh]"/>
      <Row title="Trending Now" items={movies} onAdd={addToList} />
      <Row title="Comedies" items={comedy} onAdd={addToList} />
      {token && mylist.length > 0 && <Row title="My List" items={mylist} />}
      <footer className="text-center text-white/50 py-8">Demo clone for educational purposes</footer>
    </div>
  )
}

function Root() {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  )
}

export default Root
