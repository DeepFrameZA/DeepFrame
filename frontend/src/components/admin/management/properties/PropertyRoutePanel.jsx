import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useProperty } from "../../../../hooks/useProperty";
import { getPropertyRequest } from "../../../../lib/property";
import DashboardPanel from "../../DashboardPanel";
import CreatePropertyForm from "./CreatePropertyForm";
import EditPropertyForm from "./EditPropertyForm";

const basePath = "/admin/management/properties";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function PropertyPanelContent({ mode, propertyId }) {
  const navigate = useNavigate();
  const { search } = useLocation();

  const { createProperty, updateProperty, listPropertyContexts } =
    useProperty();

  const [result, setResult] = useState({
    status: "loading",
    property: null,
  });

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (mode === "create") {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const property = uuidPattern.test(propertyId ?? "")
          ? await getPropertyRequest(propertyId)
          : null;

        if (!cancelled) {
          setResult({
            status: property ? "ready" : "missing",
            property,
          });
        }
      } catch {
        if (!cancelled) {
          setResult({
            status: "error",
            property: null,
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [mode, propertyId, attempt]);

  function closePanel() {
    /*
     * Return to the list even when the panel was opened
     * directly from a bookmark or another website.
     * Preserve the property filter and page.
     */
    navigate(`${basePath}${search}`, { replace: true });
  }

  function retry() {
    setResult({
      status: "loading",
      property: null,
    });

    setAttempt((value) => value + 1);
  }

  const title = mode === "create" ? "Create property" : "Edit property";

  const description =
    mode === "create"
      ? "Add a property to manage its details and access."
      : "Update this property's details and development assignment.";

  return (
    <DashboardPanel
      open
      title={title}
      description={description}
      onClose={closePanel}
    >
      {mode === "create" ? (
        <CreatePropertyForm
          onClose={closePanel}
          createProperty={createProperty}
          listPropertyContexts={listPropertyContexts}
        />
      ) : result.status === "loading" ? (
        <div className="flex gap-2">
          <span className="loading loading-bars loading-xs" />
          <p role="status">Loading property…</p>
        </div>
      ) : result.status === "error" ? (
        <div className="p-5 space-y-3" role="alert">
          <p>Unable to load this property.</p>

          <button type="button" className="btn btn-outline" onClick={retry}>
            Retry
          </button>
        </div>
      ) : result.status === "missing" ? (
        <p className="p-5" role="status">
          Property is unavailable or you do not have access.
        </p>
      ) : (
        <EditPropertyForm
          property={result.property}
          onClose={closePanel}
          updateProperty={updateProperty}
          listPropertyContexts={listPropertyContexts}
        />
      )}
    </DashboardPanel>
  );
}

export default function PropertyRoutePanel({ mode }) {
  const { propertyId } = useParams();

  /*
   * A different property or mode gets fresh loading/form state.
   * Late responses from the previous panel are ignored.
   */
  return (
    <PropertyPanelContent
      key={`${mode}:${propertyId ?? "new"}`}
      mode={mode}
      propertyId={propertyId}
    />
  );
}
