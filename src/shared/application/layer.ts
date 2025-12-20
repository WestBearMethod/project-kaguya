import { Layer } from "effect";
import {
  DescriptionReaderLive,
  DescriptionWriterLive,
} from "@/description/application/DescriptionRepository.live";
import { DeleteDescription } from "@/description/application/deleteDescription";
import { GetDescriptionContent } from "@/description/application/getDescriptionContent";
import { GetDescriptions } from "@/description/application/getDescriptions";
import { SaveDescription } from "@/description/application/saveDescription";
import { DatabaseServiceLive } from "@/shared/infrastructure/db";
import { DrizzleServiceLive } from "@/shared/infrastructure/db/DrizzleService.live";
import { DeleteUser } from "@/user/application/deleteUser";
import {
  UserReaderLive,
  UserWriterLive,
} from "@/user/application/UserRepository.live";

export const UseCasesLive = Layer.mergeAll(
  SaveDescription.Live,
  GetDescriptions.Live,
  GetDescriptionContent.Live,
  DeleteDescription.Live,
  DeleteUser.Live,
);

export const AppLayerContext = UseCasesLive.pipe(
  Layer.provide(
    Layer.mergeAll(
      DescriptionReaderLive,
      DescriptionWriterLive,
      UserReaderLive,
      UserWriterLive,
    ),
  ),
);

export const AppLayer = AppLayerContext.pipe(
  Layer.provide(DrizzleServiceLive),
  Layer.provide(DatabaseServiceLive),
);
