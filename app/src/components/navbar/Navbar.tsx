import { Pages, changeView } from "../../App"
import "./Navbar.css"

export default function (){
    return <nav class="navbar">
        <p class="logo" onClick={() => {changeView(Pages.home)}}>Puissance 4 - IA</p>
    </nav>
}