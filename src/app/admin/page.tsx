"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { useUploadFile } from "@convex-dev/r2/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Upload,
  Trash2,
  Disc3,
  ShieldAlert,
  ImagePlus,
  X,
  Pencil,
  Loader2,
} from "lucide-react";
import { useCoverUrl } from "@/lib/use-cover-url";

type SortKey = "created" | "year" | "title" | "artist";

function AlbumCover({ coverKey }: { coverKey: string }) {
  const url = useCoverUrl(coverKey);
  if (!url) {
    return (
      <div className="h-10 w-10 shrink-0 animate-pulse bg-muted" />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Album cover"
      className="h-10 w-10 shrink-0 object-cover"
    />
  );
}

type EditingAlbum = {
  id: Id<"albums">;
  title: string;
  artist: string;
  releaseYear: string;
};

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const isAdmin =
    (user?.publicMetadata as Record<string, unknown> | undefined)?.role ===
    "admin";
  const albums = useQuery(api.albums.list);
  const addAlbum = useMutation(api.albums.add);
  const updateAlbum = useMutation(api.albums.update);
  const removeAlbum = useMutation(api.albums.remove);
  const uploadFile = useUploadFile(api.r2);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formColRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState<number | undefined>(undefined);

  const [editing, setEditing] = useState<EditingAlbum | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<Id<"albums"> | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("created");
  const [sortAsc, setSortAsc] = useState(false);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const sortedAlbums = useMemo(() => {
    if (!albums) return undefined;
    const sorted = [...albums];
    const dir = sortAsc ? 1 : -1;
    switch (sortBy) {
      case "year":
        sorted.sort((a, b) => (a.releaseYear - b.releaseYear) * dir);
        break;
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title) * dir);
        break;
      case "artist":
        sorted.sort((a, b) => a.artist.localeCompare(b.artist) * dir);
        break;
      case "created":
      default:
        sorted.sort((a, b) => (b._creationTime - a._creationTime) * dir);
        break;
    }
    return sorted;
  }, [albums, sortBy, sortAsc]);

  useEffect(() => {
    const el = formColRef.current;
    if (!el) return;
    const update = () => setFormHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleFile = useCallback((f: File | null) => {
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f?.type.startsWith("image/")) {
        handleFile(f);
      }
    },
    [handleFile],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    try {
      const key = await uploadFile(file);
      await addAlbum({
        title,
        artist,
        releaseYear: parseInt(releaseYear, 10),
        coverKey: key,
      });
      setTitle("");
      setArtist("");
      setReleaseYear("");
      clearFile();
    } finally {
      setUploading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editing) return;
    setEditSaving(true);
    try {
      await updateAlbum({
        id: editing.id,
        title: editing.title,
        artist: editing.artist,
        releaseYear: parseInt(editing.releaseYear, 10),
      });
      setEditing(null);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await removeAlbum({ id: deletingId });
    setDeletingId(null);
  };

  const canSubmit =
    title.trim() &&
    artist.trim() &&
    releaseYear.trim() &&
    !isNaN(parseInt(releaseYear, 10)) &&
    file &&
    !uploading;

  const canSaveEdit =
    editing &&
    editing.title.trim() &&
    editing.artist.trim() &&
    editing.releaseYear.trim() &&
    !isNaN(parseInt(editing.releaseYear, 10)) &&
    !editSaving;

  if (!isLoaded) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </main>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-8 text-center">
          <ShieldAlert className="mx-auto mb-4 h-8 w-8 text-destructive" />
          <h1 className="text-xl font-bold uppercase tracking-wider">
            Access Denied
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need admin privileges to access this page.
          </p>
        </main>
      </>
    );
  }

  const deletingAlbum = deletingId
    ? albums?.find((a) => a._id === deletingId)
    : null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Disc3 className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold uppercase tracking-wider">Admin</h1>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          {/* Add album form */}
          <div ref={formColRef}>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              New Album
            </h2>
            <div className="border border-dashed border-border p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="artist" className="text-xs uppercase tracking-wider">
                  Artist
                </Label>
                <Input
                  id="artist"
                  placeholder="e.g. Radiohead"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs uppercase tracking-wider">
                  Album Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. OK Computer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="text-xs uppercase tracking-wider">
                  Release Year
                </Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max="2025"
                  placeholder="e.g. 1997"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Cover Art</Label>
                {preview ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Cover preview"
                      className="h-32 w-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute -right-2 -top-2 bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-6 transition-colors ${
                      dragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                  >
                    <ImagePlus className="mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Drop an image here or click to browse
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full uppercase tracking-wider"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Add Album
                  </>
                )}
              </Button>
            </form>
            </div>
          </div>

          {/* Album list */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Albums ({albums?.length ?? 0})
              </h2>
              <div className="flex items-center gap-1">
                {(
                  [
                    ["created", "New"],
                    ["year", "Year"],
                    ["title", "Title"],
                    ["artist", "Artist"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleSort(key)}
                    className={`px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors ${
                      sortBy === key
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                    {sortBy === key && (
                      <span className="ml-0.5">{sortAsc ? "↑" : "↓"}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {!sortedAlbums && (
              <p className="text-xs text-muted-foreground">Loading...</p>
            )}

            {sortedAlbums && sortedAlbums.length === 0 && (
              <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No albums yet. Add your first one!
              </div>
            )}

            {sortedAlbums && sortedAlbums.length > 0 && (
              <TooltipProvider>
                <div
                  className="overflow-y-auto border border-dashed border-border"
                  style={{ maxHeight: formHeight ? formHeight - 36 : "32rem" }}
                >
                  {sortedAlbums.map((album, i) => (
                    <div
                      key={album._id}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30 ${
                        i < sortedAlbums.length - 1
                          ? "border-b border-dashed border-border"
                          : ""
                      }`}
                    >
                      <AlbumCover coverKey={album.coverKey} />
                      <div className="flex-1 min-w-0">
                        <Tooltip>
                          <TooltipTrigger className="block max-w-full truncate text-left text-sm font-medium">
                            {album.artist} — {album.title}
                          </TooltipTrigger>
                          <TooltipContent>
                            {album.artist} — {album.title}
                          </TooltipContent>
                        </Tooltip>
                        <span className="text-xs text-primary">
                          {album.releaseYear}
                        </span>
                      </div>
                    <div className="flex shrink-0 items-center gap-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setEditing({
                            id: album._id,
                            title: album.title,
                            artist: album.artist,
                            releaseYear: String(album.releaseYear),
                          })
                        }
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeletingId(album._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  ))}
                </div>
              </TooltipProvider>
            )}
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Album</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Artist</Label>
                <Input
                  value={editing.artist}
                  onChange={(e) =>
                    setEditing({ ...editing, artist: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Album Title</Label>
                <Input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Release Year</Label>
                <Input
                  type="number"
                  min="1900"
                  max="2025"
                  value={editing.releaseYear}
                  onChange={(e) =>
                    setEditing({ ...editing, releaseYear: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button disabled={!canSaveEdit} onClick={handleEditSave}>
              {editSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Album</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deletingAlbum
                  ? `${deletingAlbum.artist} — ${deletingAlbum.title}`
                  : "this album"}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
