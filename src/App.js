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
  List,
  ListItem,
  Menu,
  MenuItem,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { DataGridPro, GridToolbar } from "@mui/x-data-grid-pro";
import { LicenseInfo } from "@mui/x-data-grid-pro";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import info from "./studies.json";
import dashStudyFiles from "./dash-study-files.json";
import userHolidays from "./user_holidays.json";
import { FolderOpen, Dashboard } from "@mui/icons-material";
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip as ReactTooltip } from "react-tooltip";
LicenseInfo.setLicenseKey(
  "369a1eb75b405178b0ae6c2b51263cacTz03MTMzMCxFPTE3MjE3NDE5NDcwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
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
    [studyData, setStudyData] = useState(null),
    [studyDataCols, setStudyDataCols] = useState(null),
    [repEvent, setRepEvent] = useState(null),
    [repEventCols, setRepEventCols] = useState(null),
    [studies, setStudies] = useState(null),
    [studiesCols, setStudiesCols] = useState(null),
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
    [open, setOpen] = useState(false),
    [treeData, setTreeData] = useState(false),
    [treeDataTable, setTreeDataTable] = useState(false),
    [showHolidays, setShowHolidays] = useState(false),
    [selectedDate, setSelectedDate] = useState(null),
    topMargin = 350,
    groupingColDef = {
      minWidth: 300,
      headerName: "Study Hierarchy",
      // TODO: allow other icons to click on, so we could expand several levels at once
      // renderCell: (cellValues) => {
      //   const { value } = cellValues;
      //   return value;
      // },
    },
    [anchorEl, setAnchorEl] = useState(null),
    handleClickMenu = (event) => {
      setAnchorEl(event.currentTarget);
    },
    handleCloseMenu = () => {
      setAnchorEl(null);
    };

  // define functions
  const openInNewTab = (url) => {
      const win = window.open(url, "_blank");
      win.focus();
    },
    handleCloseInfoDialog = () => {
      setOpen(false);
    },
    handleCloseHolidays = () => {
      setShowHolidays(false);
    },
    getTreeDataPath = (row) => row.group,
    // double click in study table opens dialog with info about what was clicked on
    handleDoubleClick = (e) => {
      const { row } = e;
      console.log(row);
      extractInfo(row.path);
      setOpen(true);
    },
    // used when user selects a level in a hierarchy to grab data of interest for what was selected
    extractInfo = (path) => {
      if (path === null) return;
      setStudy(null);
      setIndication(null);
      setCompound(null);
      setReportingEvent(null);
      setInfo1(null);
      setInfo2(null);
      const split = path.split("/");
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

  // make study & reporting event level table data
  useEffect(() => {
    console.log("info", info, "userHolidays", userHolidays);

    // studies
    const tempStudies0 = info.treegraph.filter(
        (t) => t.id.substring(0, 1) === "4"
      ),
      tempStudies1 = tempStudies0.map((s, sid) => {
        const split = s.path.split("/"),
          compound = split[2],
          indication = split[3],
          study = split[4];
        return {
          compound: compound,
          indication: indication,
          study: study,
          ...s,
        };
      });
    // merge in the info about user roles
    const tempStudies2 = tempStudies1.map((r, rid) => {
      const e0 = info.tpstudy.filter(
          (f) => f.newstudy.toUpperCase() === r.study.toUpperCase()
        ),
        e = e0.length > 0 ? e0[0] : {};
      return {
        ...r,
        ...e,
      };
    });
    const roleCols = info.roles.map((r) => {
      return {
        field: r.role
          .replace(/ /g, "_")
          .replace(/\(/g, "_")
          .replace(/\)/g, "_"),
        headerName: r.role,
        width: 150,
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            userArray = value ? value.split(",") : [];
          // console.log(userArray);
          if (userArray.length === 0) return null;
          else
            return userArray.map((u) => {
              const address = `mailto:${u}@argenx.com?subject=${row.study} - ${
                row.rep_event ? row.rep_event : null
              }`;
              return (
                <Tooltip title={"Email " + u}>
                  <Button
                    sx={{
                      mr: "4px",
                      p: 0,
                      fontSize: ".7rem",
                      minWidth: "30px",
                    }}
                    size="small"
                    variant="outlined"
                    href={address}
                  >
                    {u.substring(0, 2)}
                  </Button>
                </Tooltip>
              );
            });
        },
      };
    });
    // merge in more info about studies
    const tempStudies = tempStudies2.map((r, rid) => {
      const e0 = info.studies_info.filter(
          (f) => f.study.toUpperCase() === r.study.toUpperCase()
        ),
        e = e0.length > 0 ? e0[0] : {};
      delete r.id;
      delete e.id;
      return {
        id: rid,
        ...r,
        ...e,
      };
    });
    const studyCols = [
      "Control_Type",
      "FPFV",
      "First_ICF_date",
      "Investigational_Treatment",
      "Investigational_Treatment2",
      "LPLV",
      "No_of_subjects_treated",
      "Protocol_name",
      "Randomization_Quotient",
      "SDTM_IG_Version",
      "SDTM_Version",
      "Trial_Title",
      "adsl_refresh_date",
      "days_between",
      "days_since_last_adsl_refresh",
      "days_since_last_ae_refresh",
      "eosdt",
      "lstcndt",
      "sdtm_ae_refresh_date",
      "status",
    ].map((s) => {
      return { field: s, headerName: s.replace(/_/g, " "), width: 90 };
    });

    setStudiesCols([
      {
        field: "compound",
        headerName: "compound",
        width: 80,
        renderCell: (cellValues) => {
          const { value, row } = cellValues;
          let s = row.path.split("/");
          s.length = 3;
          let path = s.join("/");
          return (
            <Tooltip title={`Open file viewer at ${value}`}>
              <Box
                onClick={() => {
                  window.open(
                    "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=" +
                      path
                  );
                }}
              >
                {value}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        field: "indication",
        headerName: "indication",
        width: 80,
        renderCell: (cellValues) => {
          const { value, row } = cellValues;
          let s = row.path.split("/");
          s.length = 4;
          let path = s.join("/");
          return (
            <Tooltip title={`Open file viewer at ${value}`}>
              <Box
                onClick={() => {
                  window.open(
                    "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=" +
                      path
                  );
                }}
              >
                {value}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        field: "study",
        headerName: "study",
        width: 100,
        renderCell: (cellValues) => {
          const { value, row } = cellValues;
          return (
            <Tooltip title={`Open file viewer at ${value}`}>
              <Box
                onClick={() => {
                  window.open(
                    "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=" +
                      row.path +
                      "/biostat/staging"
                  );
                }}
              >
                {value}
              </Box>
            </Tooltip>
          );
        },
      },
      ...roleCols,
      ...studyCols,
    ]);
    setStudies(tempStudies);

    // reporting events
    const tempRepEvent0 = info.treegraph.filter(
        (t) => t.id.substring(0, 1) === "7"
      ),
      tempRepEvent1 = tempRepEvent0.map((s, sid) => {
        const split = s.path.split("/"),
          compound = split[2],
          indication = split[3],
          study = split[4],
          rep_event = split[7];
        return {
          id: sid,
          compound: compound,
          indication: indication,
          study: study,
          rep_event: rep_event,
          ...s,
        };
      }),
      // merge in the info about user roles
      tempRepEvent = tempRepEvent1.map((r, rid) => {
        const e0 = info.tpstudy.filter(
            (f) => f.newstudy.toUpperCase() === r.study.toUpperCase()
          ),
          e = e0.length > 0 ? e0[0] : {};
        return {
          ...r,
          ...e,
          id: rid,
          key: rid,
        };
      });
    setRepEventCols([
      {
        field: "compound",
        headerName: "compound",
        width: 80,
        renderCell: (cellValues) => {
          const { value, row } = cellValues;
          let s = row.path.split("/");
          s.length = 3;
          let path = s.join("/");
          return (
            <Tooltip title={`Open file viewer at ${value}`}>
              <Box
                onClick={() => {
                  window.open(
                    "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=" +
                      path
                  );
                }}
              >
                {value}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        field: "indication",
        headerName: "indication",
        width: 80,
        renderCell: (cellValues) => {
          const { value, row } = cellValues;
          let s = row.path.split("/");
          s.length = 4;
          let path = s.join("/");
          return (
            <Tooltip title={`Open file viewer at ${value}`}>
              <Box
                onClick={() => {
                  window.open(
                    "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=" +
                      path
                  );
                }}
              >
                {value}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        field: "study",
        headerName: "study",
        width: 100,
        renderCell: (cellValues) => {
          const { value, row } = cellValues;
          let s = row.path.split("/");
          s.pop();
          const studyPath = s.join("/");
          return (
            <Tooltip title={`Open file viewer at ${value}`}>
              <Box
                onClick={() => {
                  window.open(
                    "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=" +
                      studyPath
                  );
                }}
              >
                {value}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        field: "rep_event",
        headerName: "rep_event",
        width: 200,
        renderCell: (cellValues) => {
          const { value, row } = cellValues;
          return (
            <Tooltip title={`Open file viewer at ${value}`}>
              <Box
                onClick={() => {
                  window.open(
                    "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=" +
                      row.path
                  );
                }}
              >
                {value}
              </Box>
            </Tooltip>
          );
        },
      },
      ...roleCols,
    ]);
    setRepEvent(tempRepEvent);

    // console.log(
    //   "tempStudies",
    //   tempStudies,
    //   roleCols,
    //   "tempRepEvent",
    //   tempRepEvent
    // );
  }, []);

  // make study hierarchy table data
  useEffect(() => {
    // console.log("info", info, "dashStudyFiles", dashStudyFiles);
    const dashStudy = dashStudyFiles["SASTableData+LSAFSEARCH"].map((ds) => {
      const studyPath = ds.path.replace("/documents/meta/dashstudy.json", "");
      return { studyPath: studyPath, lastModified: ds.lastModified };
    });
    // console.log("dashStudy", dashStudy);
    const treegraph = info.treegraph,
      tempStudyData = treegraph.map((d, did) => {
        const group = d.path.substring(1).split("/"),
          f = dashStudy.filter((ds) => ds.studyPath === d.path),
          studyPath = f && f.length > 0 ? f[0].studyPath : null,
          lastModified = f && f.length > 0 ? f[0].lastModified : null;
        // console.log(f, studyPath);
        return {
          id: did,
          group: group,
          studyPath: studyPath,
          lastModified: lastModified,
          ...d,
        };
      }),
      tempStudyDataCols = [
        // { field: "group", headerName: "Study Hierarchy", width: 200 },
        {
          field: "path",
          headerName: "Path",
          width: 50,
          renderCell: (cellValues) => {
            const { value } = cellValues;
            return (
              <Tooltip title={`Open file viewer at ${value}`}>
                <IconButton
                  onClick={() => {
                    window.open(
                      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=" +
                        value
                    );
                  }}
                >
                  <FolderOpen />
                </IconButton>
              </Tooltip>
            );
          },
        },
        {
          field: "dash",
          headerName: "Old",
          width: 50,
          renderCell: (cellValues) => {
            const { row, value } = cellValues;
            if (value)
              return (
                <Tooltip
                  title={`Open old dashboard created ${row.dashLastModified}`}
                >
                  <IconButton
                    onClick={() => {
                      window.open(
                        "https://xarprod.ondemand.sas.com/lsaf/webdav/repo" +
                          value
                      );
                    }}
                  >
                    <Dashboard />
                  </IconButton>
                </Tooltip>
              );
            else return null;
          },
        },
        {
          field: "studyPath",
          headerName: "Dashboard",
          width: 50,
          renderCell: (cellValues) => {
            const { value, row } = cellValues;
            if (value)
              return (
                <Tooltip
                  title={`Open study dashboard created ${row.lastModified}`}
                >
                  <IconButton
                    onClick={() => {
                      window.open(
                        "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/tools/dashstudy/index.html?file=" +
                          value +
                          "/documents/meta/dashstudy.json"
                      );
                    }}
                  >
                    <Dashboard />
                  </IconButton>
                </Tooltip>
              );
            else return null;
          },
        },
      ];
    setStudyData(tempStudyData);
    setStudyDataCols(tempStudyDataCols);
    // console.log(
    //   "tempStudyDataCols",
    //   tempStudyDataCols,
    //   "tempStudyData",
    //   tempStudyData
    // );
  }, []);

  useEffect(() => {
    setGraph1({
      chart: {
        type: "treegraph",
        height: screenHeight -topMargin,
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
    extractInfo(singleClickedPath);
  }, [singleClickedPath, doubleClickedPath]);

  return (
    <div className="App">
      <Box sx={{ m: 2, flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <Tooltip title="View a table">
              <IconButton
                edge="start"
                color="inherit"
                sx={{ mr: 2 }}
                onClick={handleClickMenu}
                aria-label="menu"
                aria-controls={Boolean(anchorEl) ? "View a table" : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? "true" : undefined}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" color="inherit" component="div">
              Resource Management
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ ml: 2, mr: 2 }} />
            <Tooltip title="from %lsaf_getchildren(lsaf_path=/clinical, lsaf_recursive=6)">
              <Button
                color={"success"}
                size="small"
                onClick={() => {
                  setRows(null);
                  setCols(null);
                  setShowTree(true);
                  setTreeDataTable(false);
                  setSingleClickedName(null);
                  setSingleClickedPath(null);
                  setDoubleClickedName(null);
                  setDoubleClickedPath(null);
                }}
                variant="contained"
                sx={{ mt: 2, mb: 2, mr: 1 }}
              >
                Study Graph
              </Button>
            </Tooltip>
            <Tooltip title="Study Hierarchy Table">
              <Button
                color={"warning"}
                size="small"
                onClick={() => {
                  setRows(studyData);
                  setCols(studyDataCols);
                  setTreeDataTable(true);
                  setTreeData(true);
                  setShowTree(false);
                  setSingleClickedName(null);
                  setSingleClickedPath(null);
                  setDoubleClickedName(null);
                  setDoubleClickedPath(null);
                }}
                variant="contained"
                sx={{ mt: 2, mb: 2, mr: 1 }}
              >
                Hierarchy
              </Button>
            </Tooltip>
            <Tooltip title="Table of Studys">
              <Button
                color={"info"}
                size="small"
                onClick={() => {
                  setRows(studies);
                  setCols(studiesCols);
                  setTreeDataTable(false);
                  setShowTree(false);
                }}
                variant="contained"
                sx={{ mt: 2, mb: 2, mr: 1 }}
              >
                Studies
              </Button>
            </Tooltip>
            <Tooltip title="Table of Reporting Events">
              <Button
                color={"info"}
                size="small"
                onClick={() => {
                  setRows(repEvent);
                  setCols(repEventCols);
                  setTreeDataTable(false);
                  setShowTree(false);
                }}
                variant="contained"
                sx={{ mt: 2, mb: 2, mr: 1 }}
              >
                Rep Events
              </Button>
            </Tooltip>{" "}
            <Divider orientation="vertical" flexItem sx={{ ml: 2, mr: 2 }} />
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
          </Toolbar>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            onClick={handleCloseMenu}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {tables.map((t, id) => (
              <MenuItem key={"menuItem" + id} onClick={handleCloseMenu}>
                <Tooltip key={"tt" + id} title={`View the table: ${t}`}>
                  <Box
                    color={"success"}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setRows(info[t]);
                      setCols(columnDef[t]);
                      setTreeDataTable(false);
                      setShowTree(false);
                    }}
                    // sx={{ mb: 1 }}
                  >
                    {t}
                  </Box>
                </Tooltip>
              </MenuItem>
            ))}
          </Menu>
        </AppBar>
        {userHolidays.available && (
          <Box sx={{ m: 1 }}>
            <CalendarHeatmap
              startDate={new Date("2023-06-01")}
              endDate={new Date("2024-07-01")}
              values={userHolidays.available}
              classForValue={(value) => {
                if (!value) {
                  return "color-empty";
                } else if (value.count < 5) return `color-0`;
                else if (value.count < 7) return `color-1`;
                else if (value.count < 9) return `color-2`;
                else if (value.count < 11) return `color-3`;
                else if (value.count < 13) return `color-4`;
                else if (value.count < 15) return `color-5`;
                else if (value.count < 17) return `color-6`;
                else if (value.count < 19) return `color-7`;
                else if (value.count < 21) return `color-8`;
                else if (value.count < 23) return `color-9`;
                else return `color-10`;
              }}
              tooltipDataAttrs={(value) => {
                return {
                  "data-tooltip-id": "my-tooltip",
                  "data-tooltip-content": `${value.date} has ${value.count} people available`,
                };
              }}
              showWeekdayLabels={true}
              onClick={(value) => {
                setShowHolidays(true);
                setSelectedDate(value.date);
                const who = userHolidays.holidays.filter((r) => {
                  console.log(r.date, selectedDate);
                  return r.date === selectedDate;
                });
                // alert(`Clicked on value with count: ${value.count}`)
              }}
            />
            <ReactTooltip id="my-tooltip" />
          </Box>
        )}
        {rows && cols && !treeDataTable ? (
          <DataGridPro
            rows={rows}
            columns={cols}
            density="compact"
            hideFooter={true}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            // treeData={treeData}
            // getTreeDataPath={getTreeDataPath}
            sx={{
              height: windowDimension.winHeight - topMargin,
              fontWeight: "fontSize=5",
              fontSize: "0.7em",
              padding: 1,
            }}
          />
        ) : null}
        {rows && cols && treeDataTable ? (
          <DataGridPro
            rows={rows}
            columns={cols}
            density="compact"
            hideFooter={true}
            treeData={treeData}
            getTreeDataPath={getTreeDataPath}
            groupingColDef={groupingColDef}
            onRowDoubleClick={handleDoubleClick}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            defaultGroupingExpansionDepth={1}
            // apiRef={}
            // onRowClick={(e) => {
            //   setSingleClickedPath(e.row.path);
            //   setSingleClickedName(e.row.path.pop());
            // }}
            // defaultGroupingExpansionDepth={-1}
            sx={{
              height: windowDimension.winHeight - topMargin,
              fontWeight: "fontSize=5",
              fontSize: "0.7em",
              padding: 1,
            }}
          />
        ) : null}
        {graph1 && showTree ? (
          <HighchartsReact highcharts={Highcharts} options={graph1} />
        ) : null}
        {/* Dialog with info about a level in hierarchy */}
        <Dialog
          // fullScreen
          // sx={{ height: "1200" }}
          // fullWidth={true}
          // maxWidth={"sd"}
          open={open}
          onClose={handleCloseInfoDialog}
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
                {Object.keys(info1).map((k, kid) => {
                  let width = 200,
                    multiline = false;
                  if (["Trial_Title", "Protocol_name"].includes(k)) {
                    width = screenWidth - 200;
                    multiline = true;
                  }
                  if (
                    k !== "id" &&
                    info1[k] &&
                    info1[k] !== null &&
                    info2[k] !== ""
                  ) {
                    return (
                      <TextField
                        value={info1[k]}
                        label={k}
                        sx={{ width: width, mr: 2 }}
                        multiline={multiline}
                        variant="standard"
                        size="small"
                        key={"tf1" + kid}
                      />
                    );
                  } else return <></>;
                })}
              </>
            ) : null}
            {info2 ? (
              <>
                {Object.keys(info2).map((k, kid) => {
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
                        key={"tf2" + kid}
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
            <Button onClick={handleCloseInfoDialog}>Cancel</Button>
          </DialogActions>
        </Dialog>
        {/* Dialog with Holiday info */}
        <Dialog onClose={handleCloseHolidays} open={showHolidays}>
          <DialogTitle>Who is on holiday on {selectedDate}?</DialogTitle>
          <List dense>
            {userHolidays.holidays
              .filter((r) => r.date === selectedDate)
              .map((r) => (
                <ListItem>
                  <Button
                    sx={{
                      mr: "4px",
                      p: "4px",
                      fontSize: ".7rem",
                      minWidth: "30px",
                    }}
                    size="small"
                    variant="outlined"
                    href={`mailto:${r.userid}@argenx.com`}
                  >
                    {r.name} {r.profile ? "(" + r.profile + ")" : null}
                  </Button>
                </ListItem>
              ))}
          </List>
        </Dialog>
      </Box>
    </div>
  );
}

export default App;
