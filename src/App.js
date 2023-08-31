import "./App.css";
import { useState, useEffect } from "react";
import {
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
  ListItemIcon,
  Grid,
} from "@mui/material";
import {
  Visibility,
  Info,
  DashboardOutlined,
  Accessibility,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  DataGridPro,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter,
  // GridLogicOperator,
  useGridApiRef,
} from "@mui/x-data-grid-pro";
import { LicenseInfo } from "@mui/x-data-grid-pro";
import Highcharts from "highcharts";
import highchartsGantt from "highcharts/modules/gantt";
import HighchartsReact from "highcharts-react-official";
import {
  FolderOpen,
  Dashboard,
  ForwardTwoTone,
  Email,
  HolidayVillage,
} from "@mui/icons-material";
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip as ReactTooltip } from "react-tooltip";

import info from "./studies.json";
import localDashStudyFiles from "./dash-study-files.json";
import userHolidays from "./user_holidays.json";

// apply the license for data grid
LicenseInfo.setLicenseKey(
  "369a1eb75b405178b0ae6c2b51263cacTz03MTMzMCxFPTE3MjE3NDE5NDcwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
);

// initialize the module
highchartsGantt(Highcharts);

function App() {
  require("highcharts/modules/exporting")(Highcharts);
  require("highcharts/modules/treemap")(Highcharts);
  require("highcharts/modules/treegraph")(Highcharts);

  const tables = Object.keys(info),
    columnDef = {},
    screenWidth = window.innerWidth,
    screenHeight = window.innerHeight;

  // define state variables
  const { href, protocol, host } = window.location,
    mode = href.startsWith("http://localhost") ? "local" : "remote",
    urlPrefix = protocol + "//" + host,
    webDavPrefix = urlPrefix + "/lsaf/webdav/repo",
    studyListFile =
      "/general/biostat/jobs/dashboard/dev/metadata/dash-study-files.json",
    [windowDimension] = useState({
      winWidth: window.innerWidth,
      winHeight: window.innerHeight,
    }),
    daysToShow = 28,
    [rows, setRows] = useState(null),
    [cols, setCols] = useState(null),
    [rows1, setRows1] = useState(null),
    [cols1, setCols1] = useState(null),
    [rows2, setRows2] = useState(null),
    [cols2, setCols2] = useState(null),
    [studyData, setStudyData] = useState(null),
    [studyDataCols, setStudyDataCols] = useState(null),
    [userInfo, setUserInfo] = useState(null),
    [userInfoCols, setUserInfoCols] = useState(null),
    [holidayPeriods, setHolidayPeriods] = useState(null),
    [holidayPeriodsCols, setHolidayPeriodsCols] = useState(null),
    [repEvent, setRepEvent] = useState(null),
    [repEventCols, setRepEventCols] = useState(null),
    [studies, setStudies] = useState(null),
    [studiesCols, setStudiesCols] = useState(null),
    [graph1, setGraph1] = useState(null),
    [graph2, setGraph2] = useState(null),
    [showTree, setShowTree] = useState(false),
    [showGantt, setShowGantt] = useState(false),
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
    [openHierarchy, setOpenHierarchy] = useState(false),
    [openInfo, setOpenInfo] = useState(false),
    [treeData, setTreeData] = useState(false),
    [treeDataTable, setTreeDataTable] = useState(false),
    [showHolidays, setShowHolidays] = useState(false),
    [showNotHolidays, setShowNotHolidays] = useState(false),
    [showMeHols, setShowMeHols] = useState(true),
    [selectedDate, setSelectedDate] = useState(null),
    [buttonClicked, setButtonClicked] = useState(null),
    // [dashStudyFiles, setDashStudyFiles] = useState(null),
    [defaultGroupingExpansionDepth, setDefaultGroupingExpansionDepth] =
      useState(1),
    topMargin = 150,
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
    },
    [anchorEl2, setAnchorEl2] = useState(null),
    handleClickMenu2 = (event) => {
      setAnchorEl2(event.currentTarget);
    },
    handleCloseMenu2 = () => {
      setAnchorEl2(null);
    },
    apiRef = useGridApiRef(),
    filterModel0 = {
      items: [],
    },
    filterModel1 = {
      items: [
        { id: 1, field: "studyPath", operator: "contains", value: "/clinical" },
        {
          id: 2,
          field: "oldStudyPath",
          operator: "contains",
          value: "/clinical",
        },
      ],
    },
    [filterModel, setFilterModel] = useState(undefined),
    [toggle, setToggle] = useState(false);

  // define functions
  const openInNewTab = (url) => {
      const win = window.open(url, "_blank");
      win.focus();
    },
    handleCloseInfoDialog = () => {
      setOpenHierarchy(false);
    },
    handleCloseHolidays = () => {
      setShowHolidays(false);
    },
    handleCloseNotHolidays = () => {
      setShowNotHolidays(false);
    },
    getTreeDataPath = (row) => row.group,
    // double click in study table opens dialog with info about what was clicked on
    handleDoubleClick = (e) => {
      const { row } = e;
      console.log(row);
      setSingleClickedPath(row.path);
      setOpenHierarchy(true);
    },
    reset = () => {
      setStudy(null);
      setIndication(null);
      setCompound(null);
      setReportingEvent(null);
      setTreeDataTable(false);
      setShowGantt(false);
      setInfo1(null);
      setInfo2(null);
      setSingleClickedName(null);
      setSingleClickedPath(null);
      setDoubleClickedName(null);
      setDoubleClickedPath(null);
      setRows(null);
      setCols(null);
      setRows1(null);
      setCols1(null);
      setRows2(null);
      setCols2(null);
    },
    CustomToolbar1 = () => {
      return (
        <GridToolbarContainer>
          <GridToolbarQuickFilter />
          <GridToolbarExport />
          <Button
            onClick={() => {
              setDefaultGroupingExpansionDepth(
                defaultGroupingExpansionDepth === 1 ? -1 : 1
              );
              // apiRef.current.setPage(1);
            }}
          >
            Toggle Expansion
          </Button>
        </GridToolbarContainer>
      );
    },
    CustomToolbar2 = () => {
      return (
        <GridToolbarContainer>
          <GridToolbarQuickFilter />
          <GridToolbarExport />
        </GridToolbarContainer>
      );
    },
    CustomToolbar3 = () => {
      return (
        <GridToolbarContainer>
          <GridToolbarQuickFilter />
          <GridToolbarExport />
          <Toolbar title="Toggle between showing studies that have a dashboard, and those that don't">
            <Button
              onClick={() => {
                if (toggle) {
                  setToggle(false);
                  setFilterModel(filterModel1);
                } else {
                  setToggle(true);
                  setFilterModel(filterModel0);
                }
              }}
            >
              Toggle Dashboards
            </Button>
          </Toolbar>
        </GridToolbarContainer>
      );
    },
    // used when user selects a level in a hierarchy to grab data of interest for what was selected
    extractInfo = (path) => {
      if (path === null) return;
      reset();
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
    },
    ganttItem = (name, from, to, milestone) => {
      // if (from === null || to === null)
      //   return { name: name, start: undefined, end: undefined };
      const date1 = new Date(from),
        date2 = new Date(to),
        start = Date.UTC(
          date1.getUTCFullYear(),
          date1.getUTCMonth(),
          date1.getUTCDay()
        ),
        end = Date.UTC(
          date2.getUTCFullYear(),
          date2.getUTCMonth(),
          date2.getUTCDay()
        );
      return {
        name: name,
        start: start,
        end: end,
        milestone: milestone,
      };
    };
  // transformDayElement = (element, value) => {
  //   return (
  //     <svg xmlns="http://www.w3.org/2000/svg">
  //       <g>
  //         <foreignobject x="0" y="0" width="8" height="8">
  //           X
  //         </foreignobject>
  //         {element}{" "}
  //       </g>
  //     </svg>
  //   );
  // };
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

  // // we can put an alternate menu or some other function here
  // window.oncontextmenu = (e) => {
  //   console.log("e", e); // get info about where we clicked
  //   // could put a custom menu in here
  //   return false // stops right click popup menu showing
  // };

  // make study hierarchy table data
  useEffect(() => {
    const getInfo = async () => {
      let dashStudyFiles = localDashStudyFiles;
      if (mode === "remote")
        fetch(webDavPrefix + studyListFile).then(function (response) {
          // console.log(response);
          response.text().then(function (text) {
            const json = JSON.parse(text);
            console.log(json);
            dashStudyFiles = json;
          });
        });
      // setDashStudyFiles(tempStudy);
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
            info: true,
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
                    color="info"
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
                    title={`Open *old* dashboard created ${row.dashLastModified}`}
                  >
                    <IconButton
                      color="info"
                      onClick={() => {
                        window.open(
                          "https://xarprod.ondemand.sas.com/lsaf/webdav/repo" +
                            value
                        );
                      }}
                    >
                      <DashboardOutlined />
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
                      color="info"
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
          {
            field: "info",
            headerName: "Info",
            width: 50,
            renderCell: (cellValues) => {
              const { row } = cellValues;
              // console.log('row',row)
              if (row.group && row.group.length > 1) {
                return (
                  <Tooltip title={`Open info dialog`}>
                    <IconButton
                      color="info"
                      onClick={() => {
                        // setSingleClickedPath(row.path);
                        setOpenHierarchy(true);
                        // handleDoubleClick(cellValues);
                      }}
                      sx={{ fontSize: "16px" }}
                    >
                      ❔
                    </IconButton>
                  </Tooltip>
                );
              } else return null;
            },
          },
        ];
      setStudyData(tempStudyData);
      setStudyDataCols(tempStudyDataCols);

      console.log(
        "info",
        info,
        "userHolidays",
        userHolidays,
        "localDashStudyFiles",
        localDashStudyFiles
      );

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
          width: r.role.startsWith("GMA")
            ? 40
            : r.role.startsWith("Graphics")
            ? 40
            : r.role.startsWith("In-Text")
            ? 40
            : r.role.startsWith("Lead")
            ? 80
            : r.role.startsWith("Patient")
            ? 40
            : r.role.startsWith("QC")
            ? 160
            : r.role.startsWith("Tech")
            ? 160
            : null,
          renderCell: (cellValues) => {
            const { value, row } = cellValues,
              userArray = value ? value.split(",") : [];
            // console.log(userArray);
            if (userArray.length === 0) return null;
            else
              return userArray.map((u) => {
                const address = `mailto:${u}@argenx.com?subject=${
                  row.study
                } - ${row.rep_event ? row.rep_event : null}`;
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
        "status",
        "No_of_subjects_treated",
        "FPFV",
        "First_ICF_date",
        "eosdt",
        "lstcndt",
        "adsl_refresh_date",
        "LPLV",
        "sdtm_ae_refresh_date",
        "Protocol_name",
        "Trial_Title",
        "Investigational_Treatment",
        "Investigational_Treatment2",
        "Control_Type",
        "days_since_last_adsl_refresh",
        "days_since_last_ae_refresh",
        "days_between",
        "Randomization_Quotient",
        "SDTM_IG_Version",
        "SDTM_Version",
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
                  color="blue"
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
                  color="blue"
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
          width: 120,
          renderCell: (cellValues) => {
            const { value, row } = cellValues;
            return (
              <Tooltip title={`Open file viewer at ${value}`}>
                <Box
                  color="blue"
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
            e = e0.length > 0 ? e0[0] : {},
            f = dashStudy.filter((ds) => ds.studyPath === r.path),
            studyPath = f && f.length > 0 ? f[0].studyPath : null,
            lastModified = f && f.length > 0 ? f[0].lastModified : null;
          return {
            ...r,
            ...e,
            id: rid,
            key: rid,
            oldStudyPath: studyPath,
            studyPath: studyPath,
            lastModified: lastModified,
          };
        });
      setRepEventCols([
        {
          field: "compound",
          headerName: "compound",
          width: 80,
          renderCell: (cellValues) => {
            const { value, row } = cellValues;
            if (row.path === undefined || !row.path.includes("/")) return null;
            let s = row.path.split("/");
            s.length = 3;
            let path = s.join("/");
            return (
              <Tooltip title={`Open file viewer at ${value}`}>
                <Box
                  color="blue"
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
            if (row.path === undefined || !row.path.includes("/")) return null;
            let s = row.path.split("/");
            s.length = 4;
            let path = s.join("/");
            return (
              <Tooltip title={`Open file viewer at ${value}`}>
                <Box
                  color="blue"
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
            if (row.path === undefined || !row.path.includes("/")) return null;
            let s = row.path.split("/");
            s.pop();
            const studyPath = s.join("/");
            return (
              <Tooltip title={`Open file viewer at ${value}`}>
                <Box
                  color="blue"
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
                  color="blue"
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
        {
          field: "oldStudyPath",
          headerName: "Old",
          width: 50,
          renderCell: (cellValues) => {
            const { value, row } = cellValues;
            if (value)
              return (
                <Tooltip
                  title={`Open *old* study dashboard, created ${row.lastModified}`}
                >
                  <IconButton
                    color="info"
                    onClick={() => {
                      window.open(
                        `https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A//${value}/documents/projectstatus.html`
                      );
                    }}
                  >
                    <DashboardOutlined />
                  </IconButton>
                </Tooltip>
              );
            else return null;
          },
        },
        {
          field: "studyPath",
          headerName: "Dash",
          width: 50,
          renderCell: (cellValues) => {
            const { value, row } = cellValues;
            if (value)
              return (
                <Tooltip
                  title={`Open study dashboard created ${row.lastModified}`}
                >
                  <IconButton
                    color="info"
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
        ...roleCols,
      ]);
      setRepEvent(tempRepEvent);

      // user info
      const tempUserInfo = info["user_info"].map((u) => {
        const extra0 = userHolidays.users.filter((n) => n.userid === u.name);
        const extra = extra0.length > 0 ? extra0[0] : null;
        return { ...u, ...extra };
      });
      // console.log(tempUserInfo);
      setUserInfo(tempUserInfo);

      const tempUserInfoCols = [
        { field: "Name", headerName: "Name", width: 160 },
        { field: "userid", headerName: "User ID", width: 90 },
        { field: "role", headerName: "Role", width: 160 },
        { field: "profile", headerName: "Profile", width: 60 },
        { field: "study", headerName: "Study", width: 120 },
        { field: "STATUS", headerName: "Status", width: 90 },
        { field: "FPFV", headerName: "First Patient, First Visit", width: 90 },
        { field: "First_ICF_date", headerName: "First ICF", width: 90 },
        { field: "LPLV", headerName: "Last Patient, Last Visit", width: 90 },
        { field: "adsl_refresh_date", headerName: "ADSL refresh", width: 90 },
        { field: "eosdt", headerName: "End of study", width: 90 },
        { field: "lstcndt", headerName: "Last CND", width: 90 },
        { field: "sdtm_ae_refresh_date", headerName: "SDTM AE", width: 90 },
      ];
      setUserInfoCols(tempUserInfoCols);

      // holiday periods
      const tempHolidayPeriods = userHolidays["holiday_periods"].map((h) => {
        // const extra0 = userHolidays.users.filter((n) => n.userid === u.name);
        // const extra = extra0.length > 0 ? extra0[0] : null;
        return { ...h };
      });
      // console.log("tempHolidayPeriods", tempHolidayPeriods);
      setHolidayPeriods(tempHolidayPeriods);

      const tempHolidayPeriodsCols = [
        { field: "name", headerName: "Name", width: 160 },
        { field: "start_range", headerName: "From", width: 90 },
        { field: "end_range", headerName: "To", width: 90 },
        { field: "days", headerName: "Days", width: 50 },
      ];
      setHolidayPeriodsCols(tempHolidayPeriodsCols);

      // console.log(
      //   "tempStudies",
      //   tempStudies,
      //   roleCols,
      //   "tempRepEvent",
      //   tempRepEvent
      // );
    };

    getInfo(); // run it, run it

    return () => {
      // this now gets called when the component unmounts
    };
  }, [mode, webDavPrefix]);

  useEffect(() => {}, []);

  // define highcharts options for tree graph
  useEffect(() => {
    setGraph1({
      chart: {
        type: "treegraph",
        height: screenHeight - topMargin,
        width: screenWidth * 0.8,
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
                  // eslint-disable-next-line
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
                    setOpenHierarchy(true);
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
    const item1 = info.studies_info
        .filter((f) => f.FPFV !== "")
        .map((s) => {
          return ganttItem(s.study, s.FPFV, s.LPLV, false);
        }),
      item2 = info.studies_info
        .filter((f) => f.sdtm_ae_refresh_date !== null)
        .map((s) => {
          return ganttItem(
            s.study,
            s.sdtm_ae_refresh_date,
            s.sdtm_ae_refresh_date,
            true
          );
        }),
      line = [...item1, ...item2];
    setGraph2({
      chart: {
        height: screenHeight - topMargin,
        width: screenWidth * 0.8,
        zooming: { type: "xy" },
      },
      title: {
        text: "Study Overview",
      },
      yAxis: {
        uniqueNames: true,
      },
      accessibility: {
        point: {
          descriptionFormat:
            "{yCategory}. " +
            "{#if completed}Task {(multiply completed.amount 100):.1f}% completed. {/if}" +
            "Start {x:%Y-%m-%d}, end {x2:%Y-%m-%d}.",
        },
      },
      lang: {
        accessibility: {
          axis: {
            xAxisDescriptionPlural:
              "The chart has a two-part X axis showing time in both week numbers and days.",
          },
        },
      },
      series: [
        {
          name: "First -> Last Patient --- Last SDTM AE",
          data: line,
        },
      ],
    });
  }, [screenHeight, screenWidth]);

  // extract study name if we can
  useEffect(() => {
    extractInfo(singleClickedPath);
    // eslint-disable-next-line
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
                  reset();
                  setShowTree(true);
                  setButtonClicked("SG");
                }}
                variant="contained"
                sx={{ mt: 2, mb: 2, mr: 1 }}
              >
                Study Graph
              </Button>
            </Tooltip>
            <Tooltip title="Show Gantt chart for studies">
              <Button
                color={"success"}
                size="small"
                onClick={() => {
                  reset();
                  setShowTree(false);
                  setShowGantt(true);
                  setButtonClicked("G");
                }}
                variant="contained"
                sx={{ mt: 2, mb: 2, mr: 1 }}
              >
                Gantt
              </Button>
            </Tooltip>
            <Tooltip title="Study Hierarchy Table">
              <Button
                color={"warning"}
                size="small"
                onClick={() => {
                  reset();
                  setRows(studyData);
                  setCols(studyDataCols);
                  setTreeDataTable(true);
                  setTreeData(true);
                  setShowTree(false);
                  setButtonClicked("H");
                  setFilterModel(undefined);
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
                  reset();
                  setRows(studies);
                  setCols(studiesCols);
                  setShowTree(false);
                  setButtonClicked("S");
                  setFilterModel(undefined);
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
                  reset();
                  setRows(repEvent);
                  setCols(repEventCols);
                  setShowTree(false);
                  setButtonClicked("RE");
                }}
                variant="contained"
                sx={{ mt: 2, mb: 2, mr: 1 }}
              >
                Rep Events
              </Button>
            </Tooltip>
            <Tooltip title="Table of User Information">
              <Button
                color={"secondary"}
                size="small"
                onClick={() => {
                  reset();
                  setRows(userInfo);
                  setCols(userInfoCols);
                  setShowTree(false);
                  setButtonClicked("U");
                  setFilterModel(undefined);
                }}
                variant="contained"
                sx={{ mt: 2, mb: 2, mr: 1 }}
              >
                User Info
              </Button>
            </Tooltip>
            <Tooltip title="Table of Holidays">
              <Button
                color={"secondary"}
                size="small"
                onClick={() => {
                  reset();
                  setRows(holidayPeriods);
                  setCols(holidayPeriodsCols);
                  setShowTree(false);
                  setButtonClicked("H");
                  setFilterModel(undefined);
                }}
                variant="contained"
                sx={{ mt: 2, mb: 2, mr: 1 }}
              >
                Holidays
              </Button>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ ml: 2, mr: 2 }} />
            {graph1 && showTree ? (
              <Tooltip
                title={singleClickedName ? `View ${singleClickedName}` : ""}
              >
                <IconButton
                  color="inherit"
                  sx={{ mr: 2 }}
                  onClick={() => {
                    setOpenHierarchy(true);
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
            <Tooltip title="Information about the data used in this screen">
              <IconButton
                size="small"
                // aria-label="account of current user"
                // aria-controls="menu-appbar"
                // aria-haspopup="true"
                onClick={() => {
                  setOpenInfo(true);
                }}
                color="inherit"
              >
                <Info />
              </IconButton>
            </Tooltip>
            <Tooltip title="Information about a person">
              <IconButton
                size="small"
                onClick={handleClickMenu2}
                aria-label="menu2"
                aria-controls={Boolean(anchorEl2) ? "View a person" : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl2) ? "true" : undefined}
                color="inherit"
              >
                <Accessibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Toggle holidays or availability">
              <IconButton
                size="small"
                onClick={() => {
                  setShowMeHols(!showMeHols);
                }}
                color={showMeHols ? "error" : "success"}
                sx={{ backgroundColor: "white" }}
              >
                <HolidayVillage />
              </IconButton>
            </Tooltip>
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
          <Menu
            anchorEl={anchorEl2}
            id="account-menu2"
            open={Boolean(anchorEl2)}
            onClose={handleCloseMenu2}
            onClick={handleCloseMenu2}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {userHolidays.users.map((u, id) => (
              <MenuItem key={"menuItem2-" + id} onClick={handleCloseMenu2}>
                <Tooltip key={"tt2-" + id} title={`View info about ${u.Name}`}>
                  <Box
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      // console.log(u,userInfo,holidayPeriods)
                      reset();
                      setRows1(userInfo.filter((f) => f.name === u.userid));
                      setCols1(userInfoCols);
                      setRows2(holidayPeriods.filter((f) => f.name === u.Name));
                      setCols2(holidayPeriodsCols);
                    }}
                    sx={{
                      color:
                        u.profile === "admin"
                          ? "blue"
                          : u.profile === "dm"
                          ? "orange"
                          : u.profile === "dm+ba"
                          ? "red"
                          : u.profile === "prg"
                          ? "green"
                          : u.profile === "prg+ba"
                          ? "red"
                          : u.profile === "stat"
                          ? "purple"
                          : u.profile === "stat+ba"
                          ? "red"
                          : "black",
                    }}
                  >
                    {u.Name + " (" + u.userid + ", " + u.profile + ")"}
                  </Box>
                </Tooltip>
              </MenuItem>
            ))}
          </Menu>
        </AppBar>
        <Grid container spacing={1}>
          <Grid item xs={3} sm={2} xl={1} sx={{ mt: 1 }}>
            {userHolidays.available && (
              <Box
                sx={{
                  m: 1,
                  maxWidth: "175px",
                  // height: (screenHeight-300) +'px' ,
                }}
              >
                <CalendarHeatmap
                  startDate={new Date("2023-06-01")}
                  endDate={new Date("2024-07-01")}
                  values={userHolidays.available}
                  horizontal={false}
                  classForValue={(value) => {
                    const dayOfMonth = value
                      ? value.date.substring(8, 10)
                      : "00";
                    // TODO - use userHolidays.info to get range of values, and then set colors based on that rather than hard-coded values
                    if (!value) {
                      return "color-empty";
                    } else if (value.count < 5)
                      return `color-10${dayOfMonth === "01" ? "f" : ""}`;
                    else if (value.count < 7)
                      return `color-9${dayOfMonth === "01" ? "f" : ""}`;
                    else if (value.count < 9)
                      return `color-8${dayOfMonth === "01" ? "f" : ""}`;
                    else if (value.count < 11)
                      return `color-7${dayOfMonth === "01" ? "f" : ""}`;
                    else if (value.count < 13)
                      return `color-6${dayOfMonth === "01" ? "f" : ""}`;
                    else if (value.count < 15)
                      return `color-5${dayOfMonth === "01" ? "f" : ""}`;
                    else if (value.count < 17)
                      return `color-4${dayOfMonth === "01" ? "f" : ""}`;
                    else if (value.count < 19)
                      return `color-3${dayOfMonth === "01" ? "f" : ""}`;
                    else if (value.count < 21)
                      return `color-2${dayOfMonth === "01" ? "f" : ""}`;
                    else if (value.count < 23)
                      return `color-1${dayOfMonth === "01" ? "f" : ""}`;
                    else return `color-0${dayOfMonth === "01" ? "f" : ""}`;
                  }}
                  // transformDayElement={transformDayElement}
                  tooltipDataAttrs={(value) => {
                    return {
                      "data-tooltip-id": "my-tooltip",
                      "data-tooltip-content": `${value.date} has ${value.count} people available`,
                    };
                  }}
                  showWeekdayLabels={true}
                  onClick={(value) => {
                    if (showMeHols) setShowHolidays(true);
                    else setShowNotHolidays(true);
                    setSelectedDate(value.date);
                    // const who = userHolidays.holidays.filter((r) => {
                    //   console.log(r.date, selectedDate);
                    //   return r.date === selectedDate;
                    // });
                    // alert(`Clicked on value with count: ${value.count}`)
                  }}
                />
                <ReactTooltip id="my-tooltip" />
              </Box>
            )}
          </Grid>
          <Grid item xs={9} sm={10} xl={11} sx={{ mt: 1 }}>
            <Box sx={{ height: screenHeight - topMargin }}>
              {rows && cols && !treeDataTable ? (
                <DataGridPro
                  rows={rows}
                  columns={cols}
                  density="compact"
                  hideFooter={true}
                  disableColumnFilter
                  disableColumnSelector
                  disableDensitySelector
                  filterModel={filterModel ? filterModel : undefined}
                  slots={{
                    toolbar:
                      buttonClicked === "RE" ? CustomToolbar3 : CustomToolbar2,
                  }}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 },
                    },
                  }}
                  getRowId={(row) =>
                    row.id || Math.floor(Math.random() * 100000000)
                  }
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
                  apiRef={apiRef}
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
                  slots={{ toolbar: CustomToolbar1 }}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 },
                    },
                  }}
                  defaultGroupingExpansionDepth={defaultGroupingExpansionDepth}
                  sx={{
                    height: windowDimension.winHeight - topMargin,
                    fontWeight: "fontSize=5",
                    fontSize: "0.7em",
                    padding: 1,
                  }}
                />
              ) : null}
              {rows1 && cols1 ? (
                <Box>
                  <b>Studies</b>
                  <DataGridPro
                    rows={rows1}
                    columns={cols1}
                    density="compact"
                    hideFooter={true}
                    getRowId={(row) =>
                      row.id || Math.floor(Math.random() * 100000000)
                    }
                    sx={{
                      height: windowDimension.winHeight / 2.5,
                      fontWeight: "fontSize=5",
                      fontSize: "0.7em",
                      padding: 1,
                    }}
                  />
                </Box>
              ) : null}
              {rows2 && cols2 ? (
                <Box>
                  <b>Holidays & Days off</b>
                  <DataGridPro
                    rows={rows2}
                    columns={cols2}
                    density="compact"
                    hideFooter={true}
                    getRowId={(row) =>
                      row.id || Math.floor(Math.random() * 100000000)
                    }
                    sx={{
                      height: windowDimension.winHeight / 2.5,
                      fontWeight: "fontSize=5",
                      fontSize: "0.7em",
                      padding: 1,
                    }}
                  />
                </Box>
              ) : null}
              {graph1 && showTree ? (
                <HighchartsReact highcharts={Highcharts} options={graph1} />
              ) : null}
              {graph2 && showGantt ? (
                <HighchartsReact
                  highcharts={Highcharts}
                  constructorType={"ganttChart"}
                  options={graph2}
                />
              ) : null}
            </Box>
          </Grid>
        </Grid>

        {/* Dialog with info about a level in hierarchy */}
        <Dialog
          // fullScreen
          // sx={{ height: "1200" }}
          // fullWidth={true}
          // maxWidth={"sd"}
          open={openHierarchy}
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
        <Dialog
          onClose={handleCloseHolidays}
          open={showHolidays}
          maxWidth={"xl"}
        >
          <DialogTitle>
            Who is away on {selectedDate}? (& their availability beyond that)
          </DialogTitle>
          <DialogContent>
            <List dense>
              {userHolidays.holidays
                .filter((r) => r.date === selectedDate)
                .map((r, rid) => (
                  <ListItem key={"listitem" + rid}>
                    <Tooltip title="View this user">
                      <IconButton
                        color={
                          r.profile === "admin"
                            ? "success"
                            : r.profile === "dm"
                            ? "secondary"
                            : r.profile === "dm+ba"
                            ? "error"
                            : r.profile === "prg"
                            ? "success"
                            : r.profile === "prg+ba"
                            ? "error"
                            : r.profile === "stat"
                            ? "warning"
                            : r.profile === "stat+ba"
                            ? "error"
                            : "info"
                        }
                        onClick={() => {
                          reset();
                          setRows1(userInfo.filter((f) => f.Name === r.name));
                          setCols1(userInfoCols);
                          setRows2(
                            holidayPeriods.filter((f) => f.name === r.name)
                          );
                          setCols2(holidayPeriodsCols);
                        }}
                      >
                        <Accessibility />
                      </IconButton>
                    </Tooltip>
                    <IconButton
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
                      <Email />
                    </IconButton>
                    {userHolidays.all_days
                      .filter(
                        (h) =>
                          h.name === r.name &&
                          Date.parse(h.date) >= Date.parse(selectedDate) &&
                          Date.parse(h.date) <=
                            Date.parse(selectedDate) +
                              3600 * 1000 * 24 * daysToShow
                      )
                      .map((r, rid) => {
                        return (
                          <Box sx={{ fontSize: "12px" }} key={"box" + rid}>
                            {/* {r.date.substring(8, 10)} */}
                            {r.days === 0.5 ? "❎" : r.days > 0 ? "🟩" : "🟥"}
                            {new Date(r.date).getDay() === 5 ? "➖" : null}
                          </Box>
                        );
                      })}
                    {"↔ " + r.name} {r.profile ? "(" + r.profile + ")" : null}
                  </ListItem>
                ))}
            </List>
          </DialogContent>
        </Dialog>

        {/* Dialog with Not Holiday info */}
        <Dialog
          onClose={handleCloseNotHolidays}
          open={showNotHolidays}
          maxWidth={"xl"}
        >
          <DialogTitle>
            Who is present on {selectedDate}? (& their availability beyond that)
          </DialogTitle>
          <DialogContent>
            <List dense>
              {userHolidays.not_holidays
                .filter((r) => r.date === selectedDate)
                .map((r, rid) => (
                  <ListItem key={"listitem" + rid}>
                    <Tooltip title="View this user">
                      <IconButton
                        color={
                          r.profile === "admin"
                            ? "success"
                            : r.profile === "dm"
                            ? "secondary"
                            : r.profile === "dm+ba"
                            ? "error"
                            : r.profile === "prg"
                            ? "success"
                            : r.profile === "prg+ba"
                            ? "error"
                            : r.profile === "stat"
                            ? "warning"
                            : r.profile === "stat+ba"
                            ? "error"
                            : "info"
                        }
                        onClick={() => {
                          reset();
                          setRows1(userInfo.filter((f) => f.Name === r.name));
                          setCols1(userInfoCols);
                          setRows2(
                            holidayPeriods.filter((f) => f.name === r.name)
                          );
                          setCols2(holidayPeriodsCols);
                        }}
                      >
                        <Accessibility />
                      </IconButton>
                    </Tooltip>
                    <IconButton
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
                      <Email />
                    </IconButton>
                    {userHolidays.all_days
                      .filter(
                        (h) =>
                          h.name === r.name &&
                          Date.parse(h.date) >= Date.parse(selectedDate) &&
                          Date.parse(h.date) <=
                            Date.parse(selectedDate) +
                              3600 * 1000 * 24 * daysToShow
                      )
                      .map((r, rid) => {
                        return (
                          <Box sx={{ fontSize: "12px" }} key={"box" + rid}>
                            {/* {r.date.substring(8, 10)}  */}
                            {r.days === 0.5 ? "❎" : r.days > 0 ? "🟩" : "🟥"}
                            {new Date(r.date).getDay() === 5 ? "➖" : null}
                          </Box>
                        );
                      })}
                    {"↔ " + r.name} {r.profile ? "(" + r.profile + ")" : null}
                  </ListItem>
                ))}
            </List>
          </DialogContent>
        </Dialog>

        {/* Dialog with General info about this screen */}
        <Dialog fullWidth onClose={() => setOpenInfo(false)} open={openInfo}>
          <DialogTitle>Info about this screen</DialogTitle>
          <DialogContent>
            <u>The following data sources are used:</u>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <ForwardTwoTone />
                </ListItemIcon>
                <p>
                  <a
                    href="https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/metadata/projects/studies.json"
                    target="_blank"
                    rel="noreferrer"
                  >
                    /general/biostat/metadata/projects/studies.json
                  </a>{" "}
                  which is produced by{" "}
                  <a
                    href="https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/metadata/projects/create%20studies%20json%20file.sas"
                    target="_blank"
                    rel="noreferrer"
                  >
                    /general/biostat/metadata/projects/create studies json
                    file.sas
                  </a>{" "}
                  (last run at{" "}
                  <span style={{ color: "blue" }}>
                    {info.info[0].data_processed.replace("T", " ")}
                  </span>
                  ) which has some hard-coded data about studies which could
                  potentially be automated some more in future. It also makes
                  some LSAF API call to get a list of directories so we know
                  what the study hierarchy is.
                </p>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ForwardTwoTone />
                </ListItemIcon>
                <p>
                  <a
                    href="https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/jobs/dashboard/dev/metadata/dash-study-files.json"
                    target="_blank"
                    rel="noreferrer"
                  >
                    /general/biostat/jobs/dashboard/dev/metadata/dash-study-files.json
                  </a>{" "}
                  which is generated when postprocessing is run after each job
                  on LSAF.
                </p>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ForwardTwoTone />
                </ListItemIcon>
                <p>
                  <a
                    href="https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/metadata/projects/user_holidays.json"
                    target="_blank"
                    rel="noreferrer"
                  >
                    /general/biostat/metadata/projects/user_holidays.json
                  </a>{" "}
                  which is generated by{" "}
                  <a
                    href="https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/metadata/projects/create%20user_holidays%20json%20file.sas"
                    target="_blank"
                    rel="noreferrer"
                  >
                    /general/biostat/metadata/projects/create user_holidays json
                    file.sas
                  </a>{" "}
                  (last run at{" "}
                  <span style={{ color: "blue" }}>
                    {userHolidays.info[0].data_processed.replace("T", " ")}
                  </span>
                  ) running against the holiday EXCEL sheet. The EXCEL sheet is
                  currently taken from{" "}
                  <a
                    href="https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/fileviewer/index.html?file=https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/metadata/projects/create%20user_holidays%20json%20file.sas"
                    target="_blank"
                    rel="noreferrer"
                  >
                    SharePoint
                  </a>{" "}
                  and moved to a location for running the SAS program against.
                  This needs automating.
                </p>
              </ListItem>
            </List>
          </DialogContent>
        </Dialog>
      </Box>
    </div>
  );
}

export default App;
