import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Button from '../Button/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import './MissionOptions.scss'
import CodeSnippet from "../CodeSnippet/CodeSnippet";

const ITEM_HEIGHT = 48;


/**
 * Menu with various options for the selected plan or mission. Selecting an option may
 * result in a dialog box appearing to ask for confirmation.
 * @param props
 * @returns {JSX.Element}
 */
export default function MissionOptions(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogText, setDialogText] = React.useState("");

  const handleDialogClose = (event) => {

    if (event.currentTarget.innerText === "DELETE") {
      if (dialogText === "delete plan") {
          props.deletePlan(props.plan.name)
      } else if (dialogText === "delete mission") {
        console.log(event.currentTarget.innerText, dialogText)
        props.deleteMission(props.plan.name, props.selectedMission)
      }
    }
    handleClose();

    setDialogOpen(false);
  };

  const handleClickItem = (event) => {
    setDialogOpen(true)
    setDialogText(event.currentTarget.innerText)
  };

  return (
    <div className={"MissionOptions"}>
      <IconButton
        size="small"
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
          },
        }}
      >
        {props.options.map((option) => (
          <MenuItem key={option}
                    onClick={handleClickItem}>
            {option}
          </MenuItem>
        ))}
      </Menu>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {dialogText === "delete plan" ? (<DeletePlanDialog handleDialogClose={handleDialogClose} plan={props.plan} />)
          : dialogText === "delete mission" ? (<DeleteMissionDialog handleDialogClose={handleDialogClose} selectedMission={props.selectedMission} />)
          : dialogText === "start new mission" ? (<StartMissionDialog handleDialogClose={handleDialogClose} plan={props.plan}  />)
          : ""}
      </Dialog>
    </div>
  );
}

function DeletePlanDialog(props) {
  let key = "demo"
  if (localStorage.keys) {
    key = JSON.parse(localStorage.keys).active.id
  }

  return (
    <>
    <DialogTitle id="alert-dialog-title">
      Delete this plan?
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Are you sure you want to permanently delete this plan?
      </DialogContentText>
      <DialogContentText id="alert-dialog-description">
        Command line equivalent using the <a href={"https://pypi.org/project/houston-client/"} target="_blank" rel="noreferrer">Python client</a>:
      </DialogContentText>
      <CodeSnippet>
        <span className={"program"}>export</span> HOUSTON_KEY="{document.location.protocol}//{document.location.host}/api/v1/key/<span className={"spoiler"}>{key}"</span><br/>
        <span className={"program"}>python</span> -m houston delete --plan <span className={"string"}>"{props.plan.name}"</span>
      </CodeSnippet>
    </DialogContent>
    <DialogActions>
      <Button onClick={props.handleDialogClose}>Cancel</Button>
      <Button onClick={props.handleDialogClose} autoFocus>Delete</Button>
    </DialogActions>
    </>
  )
}

function DeleteMissionDialog(props) {
  let key = "demo"
  if (localStorage.keys) {
    key = JSON.parse(localStorage.keys).active.id
  }
  return (
    <>
    <DialogTitle id="alert-dialog-title">
      Delete this mission?
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Are you sure you want to permanently delete mission '{props.selectedMission}'? Mission data will be lost.
      </DialogContentText>
      <DialogContentText id="alert-dialog-description">
        To keep a log of this mission, use the <a href={"https://pypi.org/project/houston-client/"} target="_blank" rel="noreferrer">Python client</a> and save the mission data as JSON:
      </DialogContentText>
      <CodeSnippet>
        <span className={"program"}>export</span> HOUSTON_KEY="{document.location.protocol}//{document.location.host}/api/v1/key/<span className={"spoiler"}>{key}"</span><br/>
        <span className={"program"}>python</span> -m houston delete --mission_id <span className={"string"}>"{props.selectedMission}"</span> &gt; <span className={"string"}>"{props.selectedMission}.json"</span>
      </CodeSnippet>
    </DialogContent>
    <DialogActions>
      <Button onClick={props.handleDialogClose}>Cancel</Button>
      <Button onClick={props.handleDialogClose} autoFocus>Delete</Button>
    </DialogActions>
    </>
  )
}

function StartMissionDialog(props) {
  let key = "demo"
  if (localStorage.keys) {
    key = JSON.parse(localStorage.keys).active.id
  }
  return (
    <>
    <DialogTitle id="alert-dialog-title">
      Start a new mission
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        This dashboard can't communicate with your Houston services. Use the <a href={"https://pypi.org/project/houston-client/"} target="_blank" rel="noreferrer">Python client</a> to start a new mission:
      </DialogContentText>
      <CodeSnippet>
        <span className={"program"}>export</span> HOUSTON_KEY="{document.location.protocol}//{document.location.host}/api/v1/key/<span className={"spoiler"}>{key}"</span><br/>
        <span className={"program"}>python</span> -m houston start --plan <span className={"string"}>"{props.plan.name}"</span>
      </CodeSnippet>
    </DialogContent>
    <DialogActions>
      <Button onClick={props.handleDialogClose}>Close</Button>
    </DialogActions>
    </>
  )
}