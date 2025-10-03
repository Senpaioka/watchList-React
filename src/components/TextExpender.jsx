import { useState } from "react";

function TextExpender({collapsedNumWords=20, expendButtonText="Show More", collapseButtonText="Show Less", buttonColor='#1f09cd', expanded=false, className="", children}) {

    // styles 
    const buttonStyle = {
        background: 'none',
        border: 'none',
        font: 'inherit',
        cursor: 'pointer',
        marginLeft: '6px',
        color: buttonColor,
    }


    // functionality
    const [isExpanded, setExpanded] = useState(expanded)
    const displayText = isExpanded ? children : children.split(' ').slice(0, collapsedNumWords).join(' ')+'...';

    function handleExpand() {
        setExpanded(!isExpanded)
    }

    return (
        <div className={className}>
            <span>
                {displayText}
            </span>
            <button onClick={handleExpand} style={buttonStyle}>{isExpanded ? collapseButtonText : expendButtonText}</button>
        </div>
    )
}

export default TextExpender;


