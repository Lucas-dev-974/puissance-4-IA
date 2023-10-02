import { JSXElement, children } from "solid-js";
import "./CardWrapper.css";

interface CardWrapperProps {
    children: JSXElement;
    class?: string;
}

export default function (props: CardWrapperProps){
    const child = children(() => props.children)
    
    return <article class={"card " + props.class}>
        {child()}
    </article>
}