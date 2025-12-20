import { Layer } from "effect";
import { DeleteDescription } from "@/application/description/deleteDescription";
import { GetDescriptionContent } from "@/application/description/getDescriptionContent";
import { GetDescriptions } from "@/application/description/getDescriptions";
import { SaveDescription } from "@/application/description/saveDescription";
import { DeleteUser } from "@/application/user/deleteUser";
import { DatabaseServiceLive } from "@/infrastructure/db/service";
import {
  DescriptionReaderLive,
  DescriptionWriterLive,
} from "@/infrastructure/description/DescriptionRepository.live";
import {
  UserReaderLive,
  UserWriterLive,
} from "@/infrastructure/user/UserRepository/UserRepository.live";

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
  Layer.provide(DatabaseServiceLive),
);
