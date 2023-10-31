import * as React from "react";
import {ButtonSmall} from "../Button/Button";
import "./CodeSnippet.css"

const CodeSnippet = (props) => {

  const ref = React.useRef()
  const [copied, setCopied] = React.useState(false)

  const handleCopyCode = () => {
    const copyText = ref.current
    navigator.clipboard.writeText(copyText.innerText);
    setCopied(true)
  }

  return (
    <pre className={"CodeSnippet"} onClick={handleCopyCode} style={{ position: "relative" }}>
      <ButtonSmall style={{position: "absolute", bottom: -25, left: 20}} startIcon={<i className={"material-icons"} >copy_all</i>}>{copied ? "copied!" : "copy"}</ButtonSmall>
      {/*<Button style={{position: "absolute", top: 0, right: 0}} endIcon={<CopyAll onClick={handleCopyCode} />}>{copied ? "copied!" : ""}</Button>*/}
      <code ref={ref}>
        {props.children}
      </code>
    </pre>

  )
}

export default CodeSnippet;
