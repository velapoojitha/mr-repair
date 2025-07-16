import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from '../../firebase';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { QrReader } from 'react-qr-reader';
import { useParams } from 'react-router';
import LoginOrSignup from '../common/LoginOrSignup';
import Out from '../common/Out';

export default function Scan(props) {
  const { workerMail, id } = useParams();
  const [res, setRes] = useState('');
  const [data, setData] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "request", workerMail));
        if (docSnap.exists()) {
          const requests = docSnap.data().request || [];
          const matched = requests.find((r) => String(r.id) === id);
          if (matched) {
            setData(matched);
          } else {
            setErrorMsg("❌ Request not found.");
          }
        } else {
          setErrorMsg("❌ Worker request data not found.");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setErrorMsg("❌ Error loading request data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [workerMail, id]);

  const validate = async () => {
    if (!data) {
      alert("❌ No data loaded to validate.");
      return;
    }

    if (res === String(data.id)) {
      try {
        // Remove old
        await updateDoc(doc(db, 'history', data.clientMail), {
          history: arrayRemove(data)
        });
        await updateDoc(doc(db, 'request', workerMail), {
          request: arrayRemove(data)
        });

        // Add updated
        const completedData = { ...data, isCompleted: true };
        await updateDoc(doc(db, 'history', data.clientMail), {
          history: arrayUnion(completedData)
        });
        await updateDoc(doc(db, 'request', workerMail), {
          request: arrayUnion(completedData)
        });

        setCompleted(true);
        alert("✅ Work marked as completed!");
      } catch (err) {
        console.error("Validation error:", err);
        alert("❌ Failed to update Firestore.");
      }
    } else {
      alert("❌ Invalid QR code. Please scan the correct one.");
      setRes('');
    }
  };

  // 🔐 If not logged in or wrong role
  if (!props.userIn) return <LoginOrSignup />;
  if (props.userType !== 'service') return <Out />;

  return (
    <Modal.Dialog>
      <Modal.Header closeButton>
        <Modal.Title>Scan QR</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <Spinner animation="border" />}
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
        {completed && <Alert variant="success">✅ Work marked as completed!</Alert>}

        {!completed && !loading && data && (
          <>
            <p><strong>Request ID:</strong> {data.id}</p>
            <p><strong>Client Email:</strong> {data.clientMail}</p>
            <p>📷 Please hold the QR code in front of the camera to scan.</p>

            <div style={{ maxWidth: '100%', marginBottom: '15px' }}>
              <QrReader
                constraints={{ facingMode: 'environment' }}
                onResult={(result, error) => {
                  if (!!result) {
                    console.log("Scanned result:", result?.text);
                    setRes(result?.text);
                  }
                  if (!!error) {
                    console.debug("QR Scan error:", error);
                  }
                }}
                containerStyle={{ width: '100%' }}
              />
            </div>

            {res && (
              <>
                <Alert variant="info">✅ Scanned Value: {res}</Alert>
                <Button variant="primary" onClick={validate}>Validate</Button>
              </>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => window.close()}>Close</Button>
      </Modal.Footer>
    </Modal.Dialog>
  );
}
