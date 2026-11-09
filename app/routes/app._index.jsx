import { useState, useCallback } from "react";
import { useLoaderData, useSubmit, useNavigation, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  InlineGrid,
  Select,
  Checkbox,
  TextField,
  Banner,
  DataTable,
  Badge,
  ProgressBar,
  Divider,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let settings = await db.cancelSettings.findUnique({ where: { shop } });
  if (!settings) {
    settings = await db.cancelSettings.create({
      data: {
        shop,
        cancellationWindowMinutes: 60,
        allowCancellation: true,
        allowAddressEdit: true,
        autoRestock: true,
        autoRefund: true,
        retentionDiscountEnabled: false,
        retentionDiscountCode: "KEEP10",
        retentionDiscountPercent: 10,
        plan: "FREE",
        monthlyActionsCount: 0,
        monthlyActionsLimit: 25,
      },
    });
  }

  const actions = await db.cancelAction.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  const totalCancels = await db.cancelAction.count({
    where: { shop, actionType: "CANCEL", status: "SUCCESS" },
  });

  const totalAddressEdits = await db.cancelAction.count({
    where: { shop, actionType: "EDIT_ADDRESS", status: "SUCCESS" },
  });

  return {
    settings,
    actions,
    metrics: {
      totalCancels,
      totalAddressEdits,
      usedActions: settings.monthlyActionsCount,
      limitActions: settings.monthlyActionsLimit,
      plan: settings.plan,
    },
  };
};
