import CreatableSelect from "react-select/creatable";
import React from "react";
import './KeySelect.scss';
import requests from '../../js/requests'

// docs: https://react-select.com/creatable
export default function KeySelect(props) {

  const getKey = (keyId) => {
    return requests.get("/key", keyId, (res, err) => {

      if (err || res.status !== 200) {
        console.error(res, err);
        return null;
      }

      if (res.data === null) {
        return null
      }

      return res.data

    }, props.demo)
  }

  // render
  const colourStyles = {
    control: (styles) => ({
      ...styles,
      backgroundColor: 'var(--background)',
    }),
    input: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        cursor: isDisabled ? 'not-allowed' : 'text',
      }
    },
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        // backgroundColor: isFocused ? "var(--text-colour)" : "var(--background)",
        backgroundColor: isFocused ? "var(--light-grey)" : isSelected ? "var(--grey)" : "var(--background)",

        color: isFocused ? "var(--background)" : isSelected ? "var(--grey)" : "var(--text-colour)",

        cursor: isDisabled ? 'not-allowed' : 'pointer',

        // ':active': {
        //   ...styles[':active'],
        //   backgroundColor: isFocused ? "red" : "green",
        //   color: isFocused ? "var(--background)" : "var(--grey)",
        //   border: '1px solid var(--text-colour)',
        // },
      };
    },
    menu: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: "var(--background)",
      }
    },
    indicatorsContainer: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }
    },
  };

  const keyList = Object.keys(props.keys.list).map(k => {
    return { label: k, value: props.keys.list[k] }
  })

  const onChange = (newValue, actionType) => {
    if (actionType.action === 'clear') {
      props.setKeys(state => {
        delete state.list[actionType.removedValues[0].label]
        state.active.id = null
        state.active.name = null
        return { ...state }
      })
    } else if (actionType.action === 'select-option') {
      props.setKeys(state => {
        state.active.id = newValue.value
        state.active.name = newValue.label
        return { ...state }
      })
      document.title = "Houston | " + newValue.label
    } else if (actionType.action === 'create-option') {

      getKey(newValue.value).then(key => {
        if (key) {
          props.setKeys(state => {
            state.list[key.name] = key.id
            state.active.id = key.id
            state.active.name = key.name
            return { ...state }
          })
          document.title = "Houston | " + key.label
        }
        else {
          alert("Key not found")
        }
      })

    }
  }

  return (
    <div className={"KeySelect KeySelect-" + (props.position)}>

      <CreatableSelect key={`select_${props.keys.active.id}`}
                       defaultValue={({label: props.keys.active.name, value: props.keys.active.id})}
                       options={keyList}
                       onChange={onChange}
                       placeholder="Enter your key..."
                       noOptionsMessage={() => "Enter your houston key..."}
                       isClearable
                       styles={colourStyles} />
    </div>

  )

}
