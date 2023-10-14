import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket, io } from "socket.io-client";
import { Show, createSignal } from "solid-js";
import { Pages, changeView } from "../App";
import { Token } from "../components/GameView/GameBoard";
import CardWrapper from "../components/card/CardWrapper";
import Button, { ButtonColor } from "../components/default-button/Button";
import ButtonSelect, { SelectOptionProps } from "../components/select-button/ButtonSelect";
import { Room } from "./Game";

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;
if(window && window.location.href.includes("localhost")){
    socket = io("http://localhost:8000");
}else socket = io("http://puissance-4-api.lelu0920.odns.fr/");


export enum GameModes {
    local = "local",
    vsPayer = "vs-player",
    vsIA = "vs-ia"
}



export enum PlayersType {
    player1 = "1",
    player2 = "2",
    ofPlayer = "0"
}
export interface Player {
    id: string;
    name: PlayersType;
    token: Token
}

export const [playerInformations, setPlayerInformaitons] = createSignal<Player>()
export const [gameMode, setGameMode] = createSignal<GameModes>()

const IALevelOptions: SelectOptionProps[] = [
    {
        text: "Facile",
        value: "easy"
    },
    {
        text: "Median",
        value: "altered"
    },
    {
        text: "Dure",
        value: "hard"
    }
]

export default function () {
    const [IALevelSelectRef, setIALevelSelectRef] = createSignal<HTMLSelectElement>()

    function getAvailableRoom(){
        socket.emit('logRooms');
        socket.on('logRooms', (room: Room) => {
            console.log("availableRooms:", room);
        });
    }

    function onClickPlay(){
        if(gameMode()){
            changeView(Pages.game)
        }else console.log("select game mode: local versus, online versus, ia versus");
        
    }
    
    return <section class="w-full">
            <button onClick={getAvailableRoom}>log room</button>
            <CardWrapper class="">
                <div>
                    <p><strong>Objectif :</strong> </p>
                     <p class="pl-5">
                        Aligner 4 pions de sa couleur horizontalement, verticalement ou en diagonale.
                     </p>
                </div>
                <div>
                    <p><strong>Déroulement :</strong> </p>
                     <p class="pl-5">
                        Deux joueurs s'alternent. <br />
                        Chaque joueur choisit une colonne pour placer un pion. <br />
                        Le pion tombe en bas de la colonne ou jusqu'à un obstacle. <br />
                    </p>
                </div>
                <div>
                    <p><strong>Fin :</strong> </p>
                     <p class="pl-5">
                        Partie gagnée si un joueur aligne 4 pions. <br />
                        Partie nulle si le plateau est rempli sans gagnant.
                    </p>
                </div>
                <div>
                    <p><strong>Stratégie :</strong> </p>
                     <p class="pl-5">
                     Bloquer l'adversaire tout en cherchant à aligner ses pions.
                    </p>
                </div>
            </CardWrapper>
  
            <div class="flex justify-between mt-5">
                <div class="w-[49%]">
                    <Button 
                        text="Contre joueur" 
                        onClick={() => {setGameMode(GameModes.vsPayer)}} 
                        variant={ButtonColor.blue} 
                        active={gameMode() === GameModes.vsPayer} />
                </div>
                <div class="w-[49%]">
                    <Button 
                        text="Contre joueur" 
                        onClick={() => {setGameMode(GameModes.vsIA)}} 
                        variant={ButtonColor.red} 
                        active={gameMode() === GameModes.vsIA} />
                </div>
            </div>

            <Show when={gameMode() == GameModes.vsIA}>
                <ButtonSelect 
                    defaultText="Choisisez le niveau de l'intelligence artificielle" 
                    ref={setIALevelSelectRef} 
                    options={IALevelOptions}   
                />
            </Show>

            <Button 
                text="Jouer" 
                class="mt-3" 
                variant={ButtonColor.blue} 
                onClick={onClickPlay} 
                active={false} />
    </section>
}