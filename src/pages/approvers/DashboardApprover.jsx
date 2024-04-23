import React, { useEffect, useRef, useState } from "react";
import { db, storage } from "../../firebase.config";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import moment from "moment";
import DataTable from "react-data-table-component";
import { MdClose } from "react-icons/md";
import FilterComponent from "../designer/FilterComponent";

const DashboardApprover = () => {
  const [requests, setRequests] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState([]);
  const [designApprovalStatus, setDesignApprovalStatus] = useState({});
  const [graphicApprovalStatus, setGraphicApprovalStatus] = useState({});
  const [appComments, setAppComments] = useState([]);
  const [expandedContentId, setExpandedContentId] = useState(null);
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const handleToggleContent = (docId) => {
    setExpandedContentId(docId === expandedContentId ? null : docId);
  };
  const handleToggleComment = (docId) => {
    setExpandedCommentId(docId === expandedCommentId ? null : docId);
  };

  useEffect(() => {
    getRequests();
  }, []);
  const getRequests = async () => {
    try {
      const data = await getDocs(
        query(collection(db, "requestData"), orderBy("id", "desc"))
      );

      console.log(data.docs);
      setRequests(
        data.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .filter((request) => request.approvalStatus === "Ready for posting")
      );
    } catch (err) {
      console.log(err);
    }
  };

  const columns = [
    {
      name: "No.",
      selector: (row, index) => index + 1,
      sortable: true,
      maxwidth: "70px",
      sortFunction: (a, b) => a - b,
      cell: (row) => <div>{row.index + 1}</div>,
    },
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <div
          style={{ whiteSpace: "pre-wrap", fontSize: "16px", color: "black" }}
        >
          {row.title}
        </div>
      ),
    },
    {
      name: "Content Body",
      selector: (row) => row.contentBody,
      sortable: true,
      width: "280px",
      cell: (row) => (
        <div>
          <button
            type="button"
            className="btn btn-link btn-read-more"
            onClick={() => handleToggleContent(row.id)}
            aria-controls={`content-${row.id}`}
            aria-expanded={row.id === expandedContentId}
            style={{ textDecoration: "none", color: "black" }}
          >
            {row.id === expandedContentId ? (
              <>
                {row.contentBody}{" "}
                <span style={{ color: "#949494", fontSize: "12px" }}>
                  {" "}
                  <br />
                  Read less
                </span>
              </>
            ) : (
              <>
                {`${row.contentBody.slice(0, 20)}... `}
                <span style={{ color: "#949494", fontSize: "12px" }}>
                  {" "}
                  <br />
                  Read more
                </span>
              </>
            )}
          </button>
        </div>
      ),
    },
    {
      name: "Hashtags",
      selector: (row) => row.hashtags,
      sortable: true,
      width: "150px",
      cell: (row) => (
        <div
          style={{ whiteSpace: "pre-wrap", fontSize: "16px", color: "black" }}
        >
          {row.hashtags}
        </div>
      ),
    },
    {
      name: "Selected Platforms",
      selector: (row) => row.selectedPlatforms,
      sortable: true,
      width: "200px",
      cell: (row) => (
        <div
          style={{ whiteSpace: "pre-wrap", fontSize: "16px", color: "black" }}
        >
          {row.selectedPlatforms}
        </div>
      ),
    },
    {
      name: "Date Time",
      width: "180px",
      selector: (row) => {
        if (row.dateTime && row.dateTime.toDate) {
          const dateTime = row.dateTime.toDate();
          return moment(dateTime).format("DD/MM/YYYY h:mm A");
        }
        return ""; // Return empty string if dateTime is not valid
      },
      sortable: true,
    },
    {
      name: "Graphic Design",
      width: "180px",
      selector: (row) => row.designer,
      sortable: true,
    },
    {
      name: "Comments",
      selector: (row) => row.comments,
      sortable: true,
      width: "280px",
      cell: (row) => (
        <button
          type="button"
          className="btn btn-link btn-read-more"
          onClick={() => handleToggleComment(row.id)}
          aria-controls={`content-${row.id}`}
          aria-expanded={row.id === expandedCommentId}
          style={{ textDecoration: "none", color: "black" }}
        >
          {row.id === expandedCommentId ? (
            <>
              {row.comments}{" "}
              <span style={{ color: "#949494", fontSize: "12px" }}>
                {" "}
                <br />
                Read less
              </span>
            </>
          ) : (
            <>
              {`${row.comments.slice(0, 20)}... `}
              <span style={{ color: "#949494", fontSize: "12px" }}>
                {" "}
                <br />
                Read more
              </span>
            </>
          )}
        </button>
      ),
    },
    {
      name: "Requester's Design",
      width: " 200px",
      cell: (row) =>
        row.attachmentURL.length > 0 ? (
          row.attachmentURL.map((url, i) => {
            const attachmentId = `${row.id}-${i}`;
            const isChecked = designApprovalStatus[attachmentId] || false;
            return (
              <div key={i}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  Asset {i + 1} - Click Here
                </a>
                <br />
                {/* <FaCheck
                  style={{ color: isChecked ? "green" : "black" }}
                  onClick={() => {
                    // Toggle the designApprovalStatus for the clicked attachment
                    const updatedStatus = isChecked ? null : "approved";
                    // Set the designApprovalStatus for the attachment to "approved"
                    setDesignApprovalStatus((prevState) => ({
                      ...prevState,
                      [attachmentId]: updatedStatus,
                    }));
                  }}
                /> */}
              </div>
            );
          })
        ) : (
          <span>Currently no designs available.</span>
        ),
    },
    {
      name: "Graphic Design Uploaded",
      width: "200px",
      cell: (row) =>
        row.designAttachmentURL ? (
          row.designAttachmentURL.map((url, i) => {
            const attachmentId1 = `${row.id}-${i}`;
            const isChecked = graphicApprovalStatus[attachmentId1] || false;
            return (
              <div key={i}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  Asset {i + 1} - Click Here
                </a>
                <br />
                {/* <FaCheck
                  style={{ color: isChecked ? "green" : "black" }}
                  onClick={() => {
                    // Toggle the designApprovalStatus for the clicked attachment
                    const updatedStatus = isChecked ? null : "approved";
                    // Set the designApprovalStatus for the attachment to "approved"
                    setGraphicApprovalStatus((prevState) => ({
                      ...prevState,
                      [attachmentId1]: updatedStatus,
                    }));
                  }}
                /> */}
              </div>
            );
          })
        ) : (
          <span>Currently no designs available.</span>
        ),
    },

    {
      name: " Approver Comments",
      selector: (row) => row.appComments,
      sortable: true,
      width: "200px",
      cell: (row) => (
        <div
          style={{ whiteSpace: "pre-wrap", fontSize: "16px", color: "black" }}
        >
          {row.appComments}
        </div>
      ),
    },
    {
      name: "Approval Status",
      selector: (row) => row.approvalStatus,
      sortable: true,
      width: "200px",
      cell: (row) => (
        <div
          style={{ whiteSpace: "pre-wrap", fontSize: "16px", color: "black" }}
        >
          {row.approvalStatus}
        </div>
      ),
    },
  ];

  return (
    <div className="container" style={{ paddingTop: "150px" }}>
      <h2 className="mb-4 text-center">Approver Dashboard</h2>

      <div style={{ overflowX: "auto" }}>
      <DataTable
            columns={columns}
            data={requests
              .map((request, index) => ({ ...request, index }))
              .filter((row) =>
                Object.values(row).some(
                  (value) =>
                    value &&
                    value
                      .toString()
                      .toLowerCase()
                      .includes(searchText.toLowerCase())
                )
              )}
            pagination
            paginationRowsPerPageOptions={[5, 10, 20]}
            paginationPerPage={5}
            // paginationServer={true}
            // customStyles={customStyles}
            responsive={true} // Enable responsive design for mobile devices
            highlightOnHover={true} // Highlight rows on hover
            striped={true}
            selectableRows
            selectableRowsHighlight
            subHeader
            subHeaderComponent={
              <FilterComponent
                onFilter={(value) => {
                  setSearchText(value);
                }}
                searchText={searchText}
              />
            }
            subHeaderAlign="right"
            subHeaderWrap={false}
            noHeader={true}
            
          />
      </div>
    </div>
  );
};

export default DashboardApprover;
