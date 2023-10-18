import { JSXElement, children } from "solid-js"
import "./ModalWrapper.css"

interface ModalWrapperProps {
  children: JSXElement
  show: boolean
}

export default function (props: ModalWrapperProps) {
  const child = children(() => props.children)
  return (
    <div class="modal-layout">
      <div
        class="modal-content"
        classList={{
          show: props.show,
        }}
      >
        {child()}
      </div>
    </div>
  )
}
