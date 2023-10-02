import CardWrapper from "../components/card/CardWrapper"

export default function () {
    return <section class="flex flex-wrap w-full">

        <div class="w-full">
            <CardWrapper class="w-[80%] mx-auto">
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
        </div>
        Home section
    </section>
}