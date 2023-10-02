import { Match, Switch, createSignal, type Component } from 'solid-js';
import Navbar from './components/navbar/Navbar';
import Home from './views/Home';

enum Pages {
  home = "home",
  game = "game"
}

const App: Component = () => {
  const [page, setOnPage] = createSignal<Pages>(Pages.home)

  return <main id='main-app'>
    <Navbar />
    <div class="pt-10">
      <Switch>
        <Match when={page() == Pages.home}>
          
          <Home />
        </Match>
      </Switch>
    </div>

  </main>
};

export default App;
