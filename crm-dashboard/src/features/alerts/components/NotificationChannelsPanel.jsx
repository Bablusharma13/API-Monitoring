import { useMemo, useState } from "react";
import { toast } from "sonner";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { ActionButton } from "../../../components/ui/ActionButton";
import { AddIcon } from "../../../components/ui/Icons";
import { AlertDialog } from "../../../components/ui/AlertDialog";
import { notificationChannelsColumns } from "./columns";
import { NotificationChannelsStatsCardRow } from "./NotificationChannelsStatsCardRow";
import { NotificationChannelFormModal } from "./NotificationChannelFormModal";
import { useGetNotificationChannelsQuery } from "../hooks/query/useGetNotificationChannelsQuery";
import { useDeleteNotificationChannelMutation } from "../hooks/query/useDeleteNotificationChannelMutation";
import {
  NOTIFICATION_CHANNELS_GROUP,
  NOTIFICATION_CHANNELS_FILTERS,
} from "../constants";
import useCurrentUser from "../../../hooks/useCurrentUser";

export const NotificationChannelsPanel = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortType, setSortType] = useState("desc");
  const [activeFilters, setActiveFilters] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState(null);

  const { isAdmin } = useCurrentUser();

  const { mutate: deleteChannel, isPending: isDeleting } =
    useDeleteNotificationChannelMutation();

  // Bounded snapshot of the full channel set, used only to compute the stat
  // cards (there is no dedicated notification-channels summary endpoint).
  const { data: statsResponse, isLoading: statsLoading } =
    useGetNotificationChannelsQuery({ limit: 200 });

  const stats = useMemo(() => {
    const channels = statsResponse?.data || [];
    return {
      total: statsResponse?.pagination?.total ?? channels.length,
      enabled: channels.filter((c) => c.enabled).length,
      totalSent: channels.reduce((sum, c) => sum + (c.stats?.sent || 0), 0),
      totalFailed: channels.reduce(
        (sum, c) => sum + (c.stats?.failed || 0),
        0,
      ),
    };
  }, [statsResponse]);

  const { data: channelsResponse, isFetching } =
    useGetNotificationChannelsQuery({
      page: pageIndex,
      limit: pageLimit,
      search: searchTerm,
      sortBy: sortField,
      sortOrder: sortType,
      filters: activeFilters,
    });

  const tableData = channelsResponse?.data || [];

  const openNew = () => {
    setActiveChannel(null);
    setFormOpen(true);
  };
  const openEdit = (row) => {
    setActiveChannel(row);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <NotificationChannelsStatsCardRow isLoading={statsLoading} {...stats} />

      <div className="flex items-center justify-between">
        <h3 className="text-[14px] text-gray-800 font-medium">
          Notification Channels
        </h3>
        <ActionButton
          action="search"
          label="Add Channel"
          icon={AddIcon}
          onClick={openNew}
        />
      </div>

      <NewTableConfig
        module="notification-channels"
        columns={notificationChannelsColumns}
        data={tableData}
        isLoading={isFetching}
        group={NOTIFICATION_CHANNELS_GROUP}
        currentPage={pageIndex}
        setCurrentPage={setPageIndex}
        pageLimit={pageLimit}
        handlePageLimitChange={setPageLimit}
        totalResults={channelsResponse?.pagination?.total || tableData.length}
        totalPages={channelsResponse?.pagination?.totalPages || 1}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortField}
        sortOrder={sortType}
        handleServerSideSorting={({ sortBy, sortDirection }) => {
          setSortField(sortBy);
          setSortType(sortDirection);
        }}
        availableAdditionalFilters={NOTIFICATION_CHANNELS_FILTERS}
        onFiltersChange={(f) => {
          setActiveFilters(f);
          setPageIndex(1);
        }}
        isAction
        actions={{
          onEdit: openEdit,
          ...(isAdmin && {
            onDelete: (row) => {
              setChannelToDelete(row);
              setDeleteOpen(true);
            },
          }),
        }}
        showRowNumbers={false}
      />

      <NotificationChannelFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        channel={activeChannel}
      />

      <AlertDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        type="danger"
        title={`Delete "${channelToDelete?.name}"?`}
        description="Any alert rules notifying through this channel will stop delivering to it. This action cannot be undone."
        itemName="Delete"
        isLoading={isDeleting}
        handleOnClick={() => {
          if (!channelToDelete?._id) return;
          deleteChannel(channelToDelete._id, {
            onSuccess: () => {
              toast.success("Notification channel deleted");
              setDeleteOpen(false);
              setChannelToDelete(null);
            },
            onError: (error) =>
              toast.error(
                error?.response?.data?.message || "Failed to delete channel",
              ),
          });
        }}
      />
    </div>
  );
};
