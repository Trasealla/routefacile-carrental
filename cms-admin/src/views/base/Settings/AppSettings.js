import React, { useEffect, useState } from "react";
import { Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  simpleGetCallAuth,
  simplePutCallAuth,
} from "../../../components/config.js/Setup";
import configWeb from "../../../components/config.js/ConfigWeb";
import { notifyError, notifySuccess } from "../../../components/notify/notify";

/**
 * Runtime switches. Right now this is just the "Pay Now" toggle, which stays
 * off until the CMI payment gateway is live — with it off the storefront only
 * offers "Pay Later".
 */
const AppSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  const load = () => {
    setLoading(true);
    simpleGetCallAuth(configWeb.GET_APP_SETTINGS)
      .then((res) => {
        setSettings(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => {
        notifyError(t("Something went wrong, please try again later"));
        setSettings([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = (item, nextValue) => {
    setSavingKey(item.key_name);
    // optimistic flip so the switch feels instant
    setSettings((prev) =>
      prev.map((s) =>
        s.key_name === item.key_name ? { ...s, enabled: nextValue } : s
      )
    );

    simplePutCallAuth(
      configWeb.PUT_APP_SETTING,
      JSON.stringify({ key_name: item.key_name, value: nextValue })
    )
      .then((res) => {
        if (res?.status === "success") {
          notifySuccess(t("Setting updated"));
        } else {
          notifyError(res?.message || t("Something went wrong, please try again later"));
          load();
        }
      })
      .catch(() => {
        notifyError(t("Something went wrong, please try again later"));
        load();
      })
      .finally(() => setSavingKey(null));
  };

  const labelFor = (key) =>
    ({
      pay_now_enabled: t("Enable “Pay Now” for customers"),
      eur_rate: t("Dirhams per euro"),
    }[key] || key);

  // toggles render as a switch; anything else (e.g. eur_rate) as a value field
  const isToggle = (key) => key === "pay_now_enabled";

  const saveValue = (item, value) => {
    setSavingKey(item.key_name);
    simplePutCallAuth(
      configWeb.PUT_APP_SETTING,
      JSON.stringify({ key_name: item.key_name, value })
    )
      .then((res) => {
        if (res?.status === "success") {
          notifySuccess(t("Setting updated"));
          load();
        } else {
          notifyError(res?.message || t("Something went wrong, please try again later"));
          load();
        }
      })
      .catch(() => {
        notifyError(t("Something went wrong, please try again later"));
        load();
      })
      .finally(() => setSavingKey(null));
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col lg="12">
          <h4 className="mb-1">{t("Settings")}</h4>
          <p className="text-muted" style={{ fontSize: 14 }}>
            {t("Switches that take effect on the website immediately — no deployment needed.")}
          </p>
        </Col>
      </Row>

      <Card className="p-3 mt-2">
        {loading ? (
          <div className="text-center py-4">
            <Spinner />
          </div>
        ) : settings.length === 0 ? (
          <div className="text-center py-4">{t("No Data Found.")}</div>
        ) : (
          settings.map((item) => (
            <Row
              key={item.key_name}
              className="align-items-center py-3"
              style={{ borderBottom: "1px solid #eef1f5" }}
            >
              <Col md="8">
                <strong style={{ fontSize: 15 }}>{labelFor(item.key_name)}</strong>
                {item.description && (
                  <div className="text-muted mt-1" style={{ fontSize: 13 }}>
                    {item.description}
                  </div>
                )}
              </Col>
              <Col md="4" className="d-flex align-items-center justify-content-md-end mt-2 mt-md-0">
                {savingKey === item.key_name && <Spinner size="sm" className="me-2" />}
                {isToggle(item.key_name) ? (
                  <Form.Check
                    type="switch"
                    id={`switch-${item.key_name}`}
                    checked={!!item.enabled}
                    disabled={savingKey === item.key_name}
                    onChange={(e) => toggle(item, e.target.checked)}
                    label={item.enabled ? t("Enabled") : t("Disabled")}
                  />
                ) : (
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0.01"
                    style={{ maxWidth: 140 }}
                    defaultValue={item.value}
                    disabled={savingKey === item.key_name}
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (v && v !== item.value) saveValue(item, v);
                    }}
                  />
                )}
              </Col>
            </Row>
          ))
        )}
      </Card>
    </Container>
  );
};

export default AppSettings;
