import { Layer } from "effect";
import { DescriptionRepository } from "@/domain/description/DescriptionRepository";
import { findByChannelId } from "./DescriptionRepository/findByChannelId.live";
import { findById } from "./DescriptionRepository/findById.live";
import { save } from "./DescriptionRepository/save.live";
import { softDelete } from "./DescriptionRepository/softDelete.live";

export const DescriptionRepositoryLive = Layer.succeed(DescriptionRepository, {
  save,
  findByChannelId,
  findById,
  softDelete,
});
