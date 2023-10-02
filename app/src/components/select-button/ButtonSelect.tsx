import { For, Setter } from "solid-js";

export interface SelectOptionProps {
    value: string;
    text: string;
}

interface ButtonSelectProps {
    name?: string;
    options: SelectOptionProps[];
    defaultText: string;
    ref: Setter<HTMLSelectElement | undefined>
    onChange?: () => void;
}

export default function (props: ButtonSelectProps){
    function name(){
        return props.name != undefined ? props.name : "";
    }

    function onChange(){
        if(props.onChange) return props.onChange()
    }

    return <select class="btn btn-red mt-3" name={name()} onChange={onChange}>
        <option value="default" selected>{props.defaultText}</option>
        <For each={props.options}>
            {(option) => <option value={option.value}>{option.text}</option>}
        </For>
    </select>
}