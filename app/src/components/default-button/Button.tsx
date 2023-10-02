enum ButtonColor {
    blue = "btn-blue",
    red = "btn-red"
}

interface ButtonProps {
    text: string;
    onClick: () => {};
    variant: ButtonColor;
}

export default function (props: ButtonProps){
    return <button class={"btn " + props.variant} onClick={props.onClick}>
        { props.text }
    </button>
}