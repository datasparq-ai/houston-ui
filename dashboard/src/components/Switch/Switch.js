import {withStyles} from "@material-ui/core/styles";
import styles from "../../style-variables";
import {Switch} from "@material-ui/core";

const StyledSwitch = withStyles({
  switchBase: {
    '&$checked': {
      color: "white",
    },
    '&$checked + $track': {
      backgroundColor: styles.faintGrey,
    },
  },
  checked: {},
  track: {},
})(Switch);

export default StyledSwitch;
