import "./App.css";
import { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  AppBar,
  Toolbar,
  DialogTitle,
  IconButton,
  Typography,
  Divider,
  TextField,
} from "@mui/material";
import { Menu, Visibility } from "@mui/icons-material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { LicenseInfo } from "@mui/x-data-grid-pro";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import info from "./studies.json";
LicenseInfo.setLicenseKey(
  "5b931c69b031b808de26d5902e04c36fTz00Njk0NyxFPTE2ODg4MDI3MDM3MjAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
);
function App() {
  require("highcharts/modules/exporting")(Highcharts);
  require("highcharts/modules/treemap")(Highcharts);
  require("highcharts/modules/treegraph")(Highcharts);

  const tables = Object.keys(info),
    columnDef = {},
    screenWidth = window.innerWidth,
    screenHeight = window.innerHeight;

  // define state variables
  const [windowDimension] = useState({
      winWidth: window.innerWidth,
      winHeight: window.innerHeight,
    }),
    [rows, setRows] = useState(null),
    [cols, setCols] = useState(null),
    [graph1, setGraph1] = useState(null),
    [showTree, setShowTree] = useState(false),
    [singleClickedName, setSingleClickedName] = useState(null),
    [, setDoubleClickedName] = useState(null),
    [singleClickedPath, setSingleClickedPath] = useState(null),
    [doubleClickedPath, setDoubleClickedPath] = useState(null),
    [study, setStudy] = useState(null),
    [indication, setIndication] = useState(null),
    [compound, setCompound] = useState(null),
    [reportingEvent, setReportingEvent] = useState(null),
    [info1, setInfo1] = useState(null),
    [info2, setInfo2] = useState(null),
    [open, setOpen] = useState(false);

  // define functions
  const openInNewTab = (url) => {
      const win = window.open(url, "_blank");
      win.focus();
    },
    handleClose = () => {
      setOpen(false);
    };

  var clickDetected = false;

  tables.forEach((t, i) => {
    const table = info[t],
      keys = Object.keys(table[0]),
      cd = keys.map((item) => {
        return { field: item, headerName: item, width: 90 };
      });
    columnDef[t] = cd;
  });
  // console.log("tables", tables, "columnDef", columnDef, "info", info);

  useEffect(() => {
    setGraph1({
      chart: {
        type: "treegraph",
        height: screenHeight * 0.95,
        width: screenWidth * 0.85,
        zooming: { type: "xy" },
      },
      accessibility: {
        enabled: false,
      },
      title: {
        text: "double click for file viewer",
      },
      credits: {
        enabled: false,
      },
      series: [
        {
          type: "treegraph",
          data: info["treegraph"],
          dataLabels: {
            align: "right",
            pointFormat: "{point.name}",
            style: {
              color: "#000000",
              textOutline: "3px #ffffff",
              whiteSpace: "nowrap",
            },
            x: -20,
            crop: false,
            overflow: "none",
          },
          allowPointSelect: true,
          point: {
            events: {
              click: (e) => {
                setSingleClickedName(e.point.name);
                setSingleClickedPath(e.point.path);
                setDoubleClickedName(null);
                setDoubleClickedPath(null);
                if (clickDetected) {
                  console.log("Double Click", e.point.name);
                  clickDetected = false;
                  setDoubleClickedName(e.point.name);
                  setDoubleClickedPath(e.point.path);
                  const len = e.point.path.split("/").length;
                  console.log(len);
                  if (e.point.name.includes("*") && len === 8)
                    openInNewTab(
                      `https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A//${e.point.path}/documents/projectstatus.html`
                    );
                  else if (e.point.name.includes("*") && len === 5)
                    setOpen(true);
                  else
                    openInNewTab(
                      `https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=${e.point.path}`
                    );
                } else {
                  console.log("Single Click", e.point.name, e);
                  clickDetected = true;
                  setTimeout(function () {
                    clickDetected = false;
                  }, 500);
                }
              },
            },
          },
          tooltip: {
            pointFormat: "{point.name}",
          },
          marker: {
            symbol: "circle",
            radius: 6,
            fillColor: "#ffffff",
            lineWidth: 3,
          },
          borderRadius: 10,
          levels: [
            {
              level: 1,
              levelIsConstant: false,
            },
            {
              level: 2,
              colorByPoint: true,
            },
            {
              level: 3,
              collapsed: true,
              colorVariation: {
                key: "brightness",
                to: -0.5,
              },
            },
            {
              level: 4,
              collapsed: true,
              colorVariation: {
                key: "brightness",
                to: 0.5,
              },
            },
          ],
        },
      ],
    });
  }, [screenHeight, screenWidth]);

  // extract study name if we can
  useEffect(() => {
    if (singleClickedPath === null) return;
    setStudy(null);
    setIndication(null);
    setCompound(null);
    setReportingEvent(null);
    setInfo1(null);
    setInfo2(null);
    const split = singleClickedPath.split("/");
    console.log(split, split.length);
    // compound
    if (split.length === 3) {
      const tempCompound = split.pop();
      console.log("tempCompound", tempCompound);
      setCompound(tempCompound);
    }
    // indication
    else if (split.length === 4) {
      const tempIndication = split.pop();
      // get info from tpindic
      const row2 = info["tpindic"].filter(
        (r) => r.indication.toUpperCase() === tempIndication.toUpperCase()
      );
      if (row2.length > 0) setInfo2(row2[0]);
      console.log("tempIndication", tempIndication, "row2", row2);
      setIndication(tempIndication);
    }
    // study
    else if (split.length === 5) {
      const tempStudy = split.pop();
      // get info from studies_info
      const row1 = info["studies_info"].filter(
        (r) => r.study.toUpperCase() === tempStudy.toUpperCase()
      );
      if (row1.length > 0) setInfo1(row1[0]);
      // get info from tpstudy
      const row2 = info["tpstudy"].filter(
        (r) => r.newstudy.toUpperCase() === tempStudy.toUpperCase()
      );
      if (row2.length > 0) setInfo2(row2[0]);
      console.log("tempStudy", tempStudy, "row1", row1, "row2", row2);
      setStudy(tempStudy);
    }
    // reporting event
    else if (split.length === 8) {
      const tempReportingEvent = split.pop();
      console.log("tempReportingEvent", tempReportingEvent);
      setReportingEvent(tempReportingEvent);
    }
  }, [singleClickedPath, doubleClickedPath]);

  return (
    <div className="App">
      <Box sx={{ m: 2, flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <AppBar position="static">
              <Toolbar variant="dense">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  sx={{ mr: 2 }}
                >
                  <Menu />
                </IconButton>
                <Typography variant="h6" color="inherit" component="div">
                  Resource Management
                </Typography>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ ml: 2, mr: 2 }}
                />
                {study ? (
                  <Typography variant="h6" color="yellow" component="div">
                    Study: {study}
                  </Typography>
                ) : null}
                {compound ? (
                  <Typography variant="h6" color="yellow" component="div">
                    Compound: {compound}
                  </Typography>
                ) : null}
                {indication ? (
                  <Typography variant="h6" color="yellow" component="div">
                    Indication: {indication}
                  </Typography>
                ) : null}
                {reportingEvent ? (
                  <Typography variant="h6" color="yellow" component="div">
                    Reporting Event: {reportingEvent}
                  </Typography>
                ) : null}
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ ml: 2, mr: 2 }}
                />
                {graph1 && showTree ? (
                  <Tooltip
                    title={singleClickedName ? `View ${singleClickedName}` : ""}
                  >
                    <IconButton
                      color="inherit"
                      sx={{ mr: 2 }}
                      onClick={() => {
                        setOpen(true);
                      }}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Toolbar>
            </AppBar>
          </Grid>
          <Grid item xs={1}>
            {tables.map((t) => (
              <Tooltip title={`View the table: ${t}`}>
                <Button
                  color={"success"}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setRows(info[t]);
                    setCols(columnDef[t]);
                    setShowTree(false);
                  }}
                  sx={{ mb: 1 }}
                >
                  {t}
                </Button>
              </Tooltip>
            ))}
            <Tooltip title="from %lsaf_getchildren(lsaf_path=/clinical, lsaf_recursive=6)">
              <Button
                color={"success"}
                size="small"
                onClick={() => {
                  setRows(null);
                  setCols(null);
                  setShowTree(true);
                  setSingleClickedName(null);
                  setSingleClickedPath(null);
                  setDoubleClickedName(null);
                  setDoubleClickedPath(null);
                }}
                variant="contained"
                sx={{ mt: 2 }}
              >
                Study hierarchy
              </Button>
            </Tooltip>
          </Grid>
          {rows ? (
            <Grid item xs={11}>
              <DataGridPro
                rows={rows}
                columns={cols}
                density="compact"
                hideFooter={true}
                sx={{
                  height: windowDimension.winHeight - 80,
                  fontWeight: "fontSize=5",
                  fontSize: "0.7em",
                  padding: 1,
                }}
              />
            </Grid>
          ) : null}
          {graph1 && showTree ? (
            <HighchartsReact highcharts={Highcharts} options={graph1} />
          ) : null}
        </Grid>
        <Dialog
          fullWidth={true}
          maxWidth={"sd"}
          open={open}
          onClose={handleClose}
        >
          <DialogTitle>
            {compound ? (
              <>
                <b>Compound: </b>
                {compound}
              </>
            ) : null}
            {indication ? (
              <>
                <b>Indication: </b>
                {indication}
              </>
            ) : null}
            {study ? (
              <>
                <b>Study: </b>
                {study}
              </>
            ) : null}
            {reportingEvent ? (
              <>
                <b>Reporting Event: </b>
                {reportingEvent}
              </>
            ) : null}
          </DialogTitle>
          <DialogContent sx={{ height: 250 }}>
            {info1 ? (
              <>
                {Object.keys(info1).map((k) => {
                  let width = 200,
                    multiline = false;
                  if (["Trial_Title", "Protocol_name"].includes(k)) {
                    width = screenWidth - 200;
                    multiline = true;
                  }
                  if (k!=='id' && info1[k] && info1[k] !== null && info2[k] !== "") {
                    return (
                      <TextField
                        value={info1[k]}
                        label={k}
                        sx={{ width: width, mr: 2 }}
                        multiline={multiline}
                        variant="standard"
                        size="small"
                      />
                    );
                  } else return <></>;
                })}
              </>
            ) : null}
            {info2 ? (
              <>
                {Object.keys(info2).map((k) => {
                  if (
                    ![
                      "id",
                      "indication",
                      "compound",
                      "newstudy",
                      "_NAME_",
                    ].includes(k) &&
                    info2[k] !== null &&
                    info2[k] !== ""
                  )
                    return (
                      <TextField
                        value={info2[k]}
                        label={k}
                        sx={{ width: 200, mr: 2 }}
                        variant="standard"
                        size="small"
                      />
                    );
                  else return <></>;
                })}
              </>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Tooltip
              title={
                singleClickedPath
                  ? `Open the file viewer at ${singleClickedPath}`
                  : ""
              }
            >
              <Button
                onClick={() => {
                  openInNewTab(
                    study
                      ? `https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=${singleClickedPath}/biostat/staging`
                      : `https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=${singleClickedPath}`
                  );
                }}
              >
                File Viewer
              </Button>
            </Tooltip>
            {singleClickedPath && singleClickedPath.split("/").length > 5 ? (
              <Tooltip
                title={
                  singleClickedPath
                    ? `Open the Study Dashboard (if it exists)`
                    : ""
                }
              >
                <Button
                  onClick={() => {
                    openInNewTab(
                      `https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A//${singleClickedPath}/documents/projectstatus.html`
                    );
                  }}
                >
                  Old Study Dashboard
                </Button>
              </Tooltip>
            ) : null}
            {singleClickedPath && singleClickedPath.split("/").length > 5 ? (
              <Tooltip
                title={
                  singleClickedPath
                    ? `Open the Study Dashboard (if it exists)`
                    : ""
                }
              >
                <Button
                  onClick={() => {
                    openInNewTab(
                      `https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/tools/dashstudy/index.html?file=${singleClickedPath}/documents/meta/dashstudy.json`
                    );
                  }}
                >
                  Study Dashboard
                </Button>
              </Tooltip>
            ) : null}
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
}

export default App;
