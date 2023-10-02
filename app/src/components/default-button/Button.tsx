import "./Button.css";

export enum ButtonColor {
    blue = "btn-blue",
    red = "btn-red"
}

interface ButtonProps {
    text: string;
    onClick: () => void;
    variant: ButtonColor;
    class?: string;
    active: boolean;
}

export default function (props: ButtonProps){
    function getClass(){
        if(props.class) return props.class
        else return ""
    }

    return <button
            classList={{
                " btn-active": props.active
            }} 
            class={"btn " + props.variant + " " + getClass()} 
            onClick={props.onClick}>
        { props.text }
    </button>
}